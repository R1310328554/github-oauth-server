const jwt = require('jsonwebtoken');
const { jwt: jwtConfig, cookie: cookieConfig } = require('../config');
const constants = require('./constants');
const { CustomError } = require('./customError');

function createToken(payload = {}) {
  const { _id, userId, status, username } = payload;
  return jwt.sign({
    _id,
    userId,
    status,
    username
  }, jwtConfig.tokenSecret, {
    expiresIn: jwtConfig.expiresIn
  });
}

function decodeToken(ctx) {
  const token = getTokenFromContext(ctx);
  if (!token) return null;
  try {
    return jwt.verify(token, jwtConfig.tokenSecret);
  } catch (error) {
    return null;
  }
}

function getTokenFromContext(ctx) {
  const cookieToken = ctx.cookies.get(jwtConfig.tokenName);
  if (cookieToken) return cookieToken;
  const auth = ctx.get('Authorization') || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

async function checkToken(ctx, next) {
  const token = getTokenFromContext(ctx);
  if (!token) {
    ctx.status = constants.HTTP_CODE.UNAUTHORIZED;
    ctx.body = {
      success: false,
      code: constants.HTTP_CODE.UNAUTHORIZED,
      msg: '未登录或登录已过期',
      data: {}
    };
    return;
  }

  try {
    jwt.verify(token, jwtConfig.tokenSecret);
  } catch (error) {
    ctx.status = constants.HTTP_CODE.UNAUTHORIZED;
    ctx.body = {
      success: false,
      code: constants.HTTP_CODE.UNAUTHORIZED,
      msg: 'token 已过期，请重新登录',
      data: {}
    };
    return;
  }

  try {
    await next();
  } catch (error) {
    throw new CustomError(error.code || 500, error.msg || error.message);
  }
}

function requireAdmin(ctx, next) {
  const user = decodeToken(ctx);
  if (!user || ![1, 2].includes(Number(user.status))) {
    ctx.status = constants.HTTP_CODE.FORBIDDEN;
    ctx.body = {
      success: false,
      code: constants.HTTP_CODE.FORBIDDEN,
      msg: '需要管理员权限',
      data: {}
    };
    return Promise.resolve();
  }
  return next();
}

function cookieOptions(overrides = {}) {
  return {
    maxAge: cookieConfig.maxAge,
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    overwrite: true,
    ...overrides
  };
}

function setTokenCookie(ctx, token) {
  ctx.cookies.set(jwtConfig.tokenName, token, cookieOptions());
  // Non-sensitive marker readable by frontend for UX state (real auth remains httpOnly JWT).
  ctx.cookies.set('nexus_logged_in', '1', cookieOptions({ httpOnly: false }));
}

function deleteTokenCookie(ctx) {
  ctx.cookies.set(jwtConfig.tokenName, '', cookieOptions({ maxAge: 0 }));
  ctx.cookies.set('nexus_logged_in', '', cookieOptions({ maxAge: 0, httpOnly: false }));
  ctx.cookies.set('thirdType', '', cookieOptions({ maxAge: 0, httpOnly: false }));
}

module.exports = {
  createToken,
  decodeToken,
  checkToken,
  requireAdmin,
  setTokenCookie,
  deleteTokenCookie,
  getTokenFromContext
};
