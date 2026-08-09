const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const User = require('../model/user');
const OAuthState = require('../model/oauthState');
const OtpChallenge = require('../model/otpChallenge');
const { getProvider } = require('../providers');
const { encrypt, randomToken, sha256Base64Url } = require('../utils/crypto');
const { CustomError } = require('../utils/customError');
const constants = require('../utils/constants');
const config = require('../config');

const STATE_TTL_MS = 10 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

function clientMeta(ctx) {
  return {
    ip: ctx.ip || ctx.request.ip || '',
    userAgent: ctx.get('user-agent') || ''
  };
}

async function createOAuthState(ctx, {
  provider,
  mode = 'login',
  userId = '',
  returnTo = ''
}) {
  const providerImpl = getProvider(provider);
  if (!providerImpl || !providerImpl.enabled) {
    throw new CustomError(constants.CUSTOM_CODE.PROVIDER_DISABLED, `提供方 ${provider} 未配置或已禁用`);
  }

  const state = randomToken(24);
  let codeVerifier = '';
  let codeChallenge = '';
  if (providerImpl.supportsPKCE) {
    codeVerifier = randomToken(48);
    codeChallenge = sha256Base64Url(codeVerifier);
  }

  const meta = clientMeta(ctx);
  await OAuthState.create({
    state,
    provider,
    codeVerifier,
    mode,
    userId,
    returnTo: returnTo || config.frontendUrl,
    ip: meta.ip,
    userAgent: meta.userAgent,
    expiresAt: new Date(Date.now() + STATE_TTL_MS)
  });

  const authorizeUrl = providerImpl.getAuthorizeUrl({
    state,
    codeChallenge,
    redirectUri: providerImpl.callbackUrl
  });

  return { state, authorizeUrl, provider: providerImpl.getPublicMeta() };
}

async function consumeOAuthState(provider, state) {
  if (!state) {
    throw new CustomError(constants.CUSTOM_CODE.STATE_INVALID, '缺少 state 参数');
  }
  const record = await OAuthState.findOne({ state, provider });
  if (!record || record.consumedAt || record.expiresAt.getTime() < Date.now()) {
    throw new CustomError(constants.CUSTOM_CODE.STATE_INVALID, 'OAuth state 无效或已过期');
  }
  record.consumedAt = new Date();
  await record.save();
  return record;
}

function mergeProfile(user, profile, provider) {
  user.username = user.username || profile.username;
  user.nickname = profile.nickname || user.nickname || profile.username;
  user.avatar = profile.avatar || user.avatar;
  user.email = user.email || profile.email;
  user.bio = profile.bio || user.bio;
  user.blog = profile.blog || user.blog;
  user.location = profile.location || user.location;
  user.lastModifiedDate = new Date();
  user.lastLoginDate = new Date();

  const existing = (user.providers || []).find((item) => item.provider === provider);
  if (existing) {
    existing.username = profile.username;
    existing.nickname = profile.nickname;
    existing.avatar = profile.avatar;
    existing.email = profile.email;
    existing.profile = profile.raw || profile;
    existing.lastLoginAt = new Date();
  }
  return user;
}

async function upsertOAuthUser({
  provider,
  profile,
  tokenPayload,
  mode,
  bindUserId,
  ctx
}) {
  const providerUserId = String(profile.providerUserId);
  if (!providerUserId) {
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '未能获取第三方用户标识');
  }

  let user = await User.findOne({
    providers: {
      $elemMatch: { provider, providerUserId }
    }
  });

  if (!user && mode === 'bind' && bindUserId) {
    user = await User.findOne({ userId: bindUserId });
    if (!user) {
      throw new CustomError(constants.CUSTOM_CODE.BIND_FAILED, '绑定失败：当前用户不存在');
    }
    const conflict = await User.findOne({
      providers: { $elemMatch: { provider, providerUserId } },
      userId: { $ne: bindUserId }
    });
    if (conflict) {
      throw new CustomError(constants.CUSTOM_CODE.BIND_FAILED, '该第三方账号已绑定其他用户');
    }
  }

  if (!user && profile.email) {
    user = await User.findOne({ email: profile.email });
  }

  const expiresAt = tokenPayload.expires_in
    ? new Date(Date.now() + Number(tokenPayload.expires_in) * 1000)
    : undefined;

  const providerAccount = {
    provider,
    providerUserId,
    username: profile.username,
    nickname: profile.nickname,
    avatar: profile.avatar,
    email: profile.email,
    profile: profile.raw || profile,
    accessTokenEnc: encrypt(tokenPayload.access_token || ''),
    refreshTokenEnc: encrypt(tokenPayload.refresh_token || ''),
    tokenExpiresAt: expiresAt,
    linkedAt: new Date(),
    lastLoginAt: new Date()
  };

  if (!user) {
    user = new User({
      userId: `${provider}_${providerUserId}`,
      username: profile.username || `${provider}_${providerUserId}`,
      nickname: profile.nickname,
      avatar: profile.avatar,
      email: profile.email,
      bio: profile.bio,
      blog: profile.blog,
      location: profile.location,
      providers: [providerAccount],
      status: constants.USER_STATUS.USER
    });
  } else {
    const idx = user.providers.findIndex((item) => item.provider === provider);
    if (idx >= 0) {
      user.providers[idx] = {
        ...user.providers[idx].toObject?.() || user.providers[idx],
        ...providerAccount,
        linkedAt: user.providers[idx].linkedAt || new Date()
      };
    } else {
      user.providers.push(providerAccount);
    }
    mergeProfile(user, profile, provider);
  }

  const meta = clientMeta(ctx);
  user.loginHistory = [...(user.loginHistory || []), {
    provider,
    ip: meta.ip,
    userAgent: meta.userAgent,
    at: new Date()
  }].slice(-30);

  await user.save();
  return user;
}

async function handleTelegramCallback(ctx, query = {}) {
  const provider = 'telegram';
  const providerImpl = getProvider(provider);
  if (!providerImpl || !providerImpl.enabled) {
    throw new CustomError(constants.CUSTOM_CODE.PROVIDER_DISABLED, '提供方 telegram 未配置或已禁用');
  }

  const stateRecord = await consumeOAuthState(provider, query.state);
  const signed = providerImpl.verifyLoginPayload(query);
  const profile = await providerImpl.getUserProfile(signed);
  const user = await upsertOAuthUser({
    provider,
    profile,
    tokenPayload: {},
    mode: stateRecord.mode,
    bindUserId: stateRecord.userId,
    ctx
  });

  return {
    user,
    returnTo: stateRecord.returnTo || config.frontendUrl,
    provider,
    mode: stateRecord.mode
  };
}

async function handleOAuthCallback(ctx, provider, { code, state, ...rest }) {
  const providerImpl = getProvider(provider);
  if (!providerImpl || !providerImpl.enabled) {
    throw new CustomError(constants.CUSTOM_CODE.PROVIDER_DISABLED, `提供方 ${provider} 未配置或已禁用`);
  }

  if (providerImpl.authType === 'telegram') {
    return handleTelegramCallback(ctx, { code, state, ...rest });
  }

  if (!code) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '缺少授权 code');
  }

  const stateRecord = await consumeOAuthState(provider, state);
  const tokenPayload = await providerImpl.exchangeCode({
    code,
    codeVerifier: stateRecord.codeVerifier,
    redirectUri: providerImpl.callbackUrl
  });
  const profile = await providerImpl.getUserProfile(tokenPayload);
  const user = await upsertOAuthUser({
    provider,
    profile,
    tokenPayload,
    mode: stateRecord.mode,
    bindUserId: stateRecord.userId,
    ctx
  });

  return {
    user,
    returnTo: stateRecord.returnTo || config.frontendUrl,
    provider,
    mode: stateRecord.mode
  };
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

async function sendWhatsAppOtp(ctx, {
  phone,
  state = '',
  mode = 'login',
  returnTo = '',
  userId = ''
}) {
  const providerImpl = getProvider('whatsapp');
  if (!providerImpl || !providerImpl.enabled) {
    throw new CustomError(constants.CUSTOM_CODE.PROVIDER_DISABLED, '提供方 whatsapp 未配置或已禁用');
  }
  const normalized = normalizePhone(phone);
  if (normalized.length < 8) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '手机号无效');
  }

  let stateRecord = null;
  if (state) {
    stateRecord = await OAuthState.findOne({ state, provider: 'whatsapp' });
    if (!stateRecord || stateRecord.consumedAt || stateRecord.expiresAt.getTime() < Date.now()) {
      throw new CustomError(constants.CUSTOM_CODE.STATE_INVALID, 'OAuth state 无效或已过期');
    }
  } else {
    const created = await createOAuthState(ctx, {
      provider: 'whatsapp',
      mode,
      userId,
      returnTo
    });
    state = created.state;
    stateRecord = await OAuthState.findOne({ state, provider: 'whatsapp' });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = crypto.createHash('sha256').update(`${normalized}:${code}`).digest('hex');

  await OtpChallenge.deleteMany({ provider: 'whatsapp', phone: normalized, consumedAt: null });
  await OtpChallenge.create({
    provider: 'whatsapp',
    phone: normalized,
    codeHash,
    state,
    mode: stateRecord.mode,
    userId: stateRecord.userId,
    returnTo: stateRecord.returnTo,
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });

  if (config.env === 'production' || process.env.WHATSAPP_SEND_REAL === '1') {
    await providerImpl.sendOtpMessage(normalized, code);
  } else {
    console.log(`[whatsapp-otp:dev] phone=${normalized} code=${code}`);
  }

  return {
    state,
    phone: normalized,
    expiresIn: Math.floor(OTP_TTL_MS / 1000),
    // Dev convenience only; never returned in production.
    devCode: config.env === 'production' ? undefined : code
  };
}

async function verifyWhatsAppOtp(ctx, { phone, code, state }) {
  const providerImpl = getProvider('whatsapp');
  if (!providerImpl || !providerImpl.enabled) {
    throw new CustomError(constants.CUSTOM_CODE.PROVIDER_DISABLED, '提供方 whatsapp 未配置或已禁用');
  }
  const normalized = normalizePhone(phone);
  if (!normalized || !code || !state) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '手机号、验证码和 state 必填');
  }

  const challenge = await OtpChallenge.findOne({
    provider: 'whatsapp',
    phone: normalized,
    state,
    consumedAt: null
  });
  if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '验证码无效或已过期');
  }
  if (challenge.attempts >= 5) {
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '验证码尝试次数过多');
  }

  const codeHash = crypto.createHash('sha256').update(`${normalized}:${code}`).digest('hex');
  challenge.attempts += 1;
  if (challenge.codeHash !== codeHash) {
    await challenge.save();
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '验证码错误');
  }

  challenge.consumedAt = new Date();
  await challenge.save();
  await consumeOAuthState('whatsapp', state);

  const profile = await providerImpl.getUserProfile({ phone: normalized });
  const user = await upsertOAuthUser({
    provider: 'whatsapp',
    profile,
    tokenPayload: {},
    mode: challenge.mode,
    bindUserId: challenge.userId,
    ctx
  });

  return {
    user,
    returnTo: challenge.returnTo || config.frontendUrl,
    provider: 'whatsapp',
    mode: challenge.mode
  };
}

async function registerLocal({ username, password, email }) {
  if (!username || !password) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '用户名和密码必填');
  }
  if (String(password).length < 8) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '密码至少 8 位');
  }
  const exists = await User.findOne({ username });
  if (exists) {
    throw new CustomError(constants.CUSTOM_CODE.USER_EXISTS, '用户名已存在');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const total = await User.countDocuments();
  const user = await User.create({
    userId: `local_${uuidv4()}`,
    username,
    nickname: username,
    email: email || '',
    passwordHash,
    providers: [],
    // First registered local user becomes super admin for bootstrap.
    status: total === 0 ? constants.USER_STATUS.SUPER_ADMIN : constants.USER_STATUS.USER
  });
  return user;
}

async function loginLocal({ username, password }, ctx) {
  if (!username || !password) {
    throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '用户名和密码必填');
  }
  const user = await User.findOne({ username }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '用户名或密码错误');
  }
  if (user.status === constants.USER_STATUS.DISABLED) {
    throw new CustomError(constants.HTTP_CODE.FORBIDDEN, '账号已被禁用');
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new CustomError(constants.CUSTOM_CODE.LOGIN_FAILED, '用户名或密码错误');
  }
  const meta = clientMeta(ctx);
  user.lastLoginDate = new Date();
  user.loginHistory = [...(user.loginHistory || []), {
    provider: 'local',
    ip: meta.ip,
    userAgent: meta.userAgent,
    at: new Date()
  }].slice(-30);
  await user.save();
  return user;
}

async function unbindProvider(userId, provider) {
  const user = await User.findOne({ userId }).select('+passwordHash');
  if (!user) {
    throw new CustomError(constants.HTTP_CODE.NOT_FOUND, '用户不存在');
  }
  const remaining = (user.providers || []).filter((item) => item.provider !== provider);
  if (remaining.length === 0 && !user.passwordHash) {
    throw new CustomError(constants.CUSTOM_CODE.BIND_FAILED, '至少保留一种登录方式');
  }
  user.providers = remaining;
  user.lastModifiedDate = new Date();
  await user.save();
  return user;
}

module.exports = {
  createOAuthState,
  handleOAuthCallback,
  handleTelegramCallback,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  registerLocal,
  loginLocal,
  unbindProvider
};
