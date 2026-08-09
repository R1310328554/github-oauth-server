const config = require('../config');
const constants = require('../utils/constants');
const { listProviders, getProvider } = require('../providers');
const {
  createOAuthState,
  handleOAuthCallback,
  unbindProvider
} = require('../services/authService');
const {
  createToken, setTokenCookie, decodeToken, checkToken
} = require('../utils/token');
const User = require('../model/user');
const { CustomError } = require('../utils/customError');

function issueSession(ctx, user, provider) {
  const token = createToken({
    _id: user._id,
    userId: user.userId,
    username: user.username,
    status: user.status
  });
  setTokenCookie(ctx, token);
  ctx.cookies.set('thirdType', provider || 'local', {
    maxAge: config.cookie.maxAge,
    httpOnly: false,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    overwrite: true
  });
  return token;
}

class OAuthController {
  static list(ctx) {
    const onlyEnabled = ctx.query.enabled === '1' || ctx.query.enabled === 'true';
    ctx.data({
      data: {
        providers: listProviders({ onlyEnabled }),
        frontendUrl: config.frontendUrl,
        callbackBase: config.oauthCallbackBase
      }
    });
  }

  static async authorize(ctx) {
    const { provider } = ctx.params;
    const mode = ctx.query.mode === 'bind' ? 'bind' : 'login';
    const returnTo = ctx.query.return_to || config.frontendUrl;
    let userId = '';

    if (mode === 'bind') {
      const session = decodeToken(ctx);
      if (!session?.userId) {
        throw new CustomError(constants.HTTP_CODE.UNAUTHORIZED, '绑定前请先登录');
      }
      userId = session.userId;
    }

    const { authorizeUrl, state } = await createOAuthState(ctx, {
      provider,
      mode,
      userId,
      returnTo
    });

    if (ctx.query.format === 'json') {
      ctx.data({
        data: { authorizeUrl, state, provider }
      });
      return;
    }
    ctx.redirect(authorizeUrl);
  }

  static async callback(ctx) {
    const { provider } = ctx.params;
    const { code, state, error, error_description: errorDescription } = ctx.query;

    if (error) {
      const target = new URL(config.frontendUrl);
      target.hash = `/login?error=${encodeURIComponent(errorDescription || error)}`;
      ctx.redirect(target.toString());
      return;
    }

    try {
      const result = await handleOAuthCallback(ctx, provider, { code, state });
      issueSession(ctx, result.user, provider);

      const target = new URL(result.returnTo || config.frontendUrl);
      // Prefer hash router used by admin app
      if (!target.hash || target.hash === '#') {
        target.hash = result.mode === 'bind' ? '/profile?bound=1' : '/?login=1';
      }
      ctx.redirect(target.toString());
    } catch (err) {
      const target = new URL(config.frontendUrl);
      target.hash = `/login?error=${encodeURIComponent(err.msg || err.message || '登录失败')}`;
      ctx.redirect(target.toString());
    }
  }

  static async unbind(ctx) {
    const session = decodeToken(ctx);
    if (!session?.userId) {
      throw new CustomError(constants.HTTP_CODE.UNAUTHORIZED, '请先登录');
    }
    const { provider } = ctx.params;
    if (!getProvider(provider)) {
      throw new CustomError(constants.CUSTOM_CODE.INVALID_PARAM, '未知提供方');
    }
    const user = await unbindProvider(session.userId, provider);
    ctx.data({
      msg: '解绑成功',
      data: user.toSafeJSON()
    });
  }

  // Backward-compatible aliases used by old frontend
  static async legacyGithubLogin(ctx) {
    ctx.params.provider = 'github';
    return OAuthController.callback(ctx);
  }

  static async legacyWeiboLogin(ctx) {
    ctx.params.provider = 'weibo';
    return OAuthController.callback(ctx);
  }
}

OAuthController.checkToken = checkToken;
OAuthController.issueSession = issueSession;

module.exports = OAuthController;
