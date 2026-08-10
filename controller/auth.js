const constants = require('../utils/constants');
const {
  registerLocal,
  loginLocal
} = require('../services/authService');
const {
  createToken, setTokenCookie, deleteTokenCookie, decodeToken, checkToken
} = require('../utils/token');
const User = require('../model/user');
const { CustomError } = require('../utils/customError');
const OAuthController = require('./oauth');
const config = require('../config');

class AuthController {
  static async register(ctx) {
    const { username, password, email } = ctx.request.body || {};
    const user = await registerLocal({ username, password, email });
    const token = OAuthController.issueSession(ctx, user, 'local');
    ctx.data({
      msg: '注册成功',
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  }

  static async login(ctx) {
    const { username, password } = ctx.request.body || {};
    const user = await loginLocal({ username, password }, ctx);
    const token = OAuthController.issueSession(ctx, user, 'local');
    ctx.data({
      msg: '登录成功',
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  }

  static logout(ctx) {
    deleteTokenCookie(ctx);
    ctx.data({ msg: '已退出登录' });
  }

  static async me(ctx) {
    const session = decodeToken(ctx);
    if (!session?._id) {
      throw new CustomError(constants.HTTP_CODE.UNAUTHORIZED, '未登录');
    }
    const user = await User.findById(session._id);
    if (!user) {
      throw new CustomError(constants.HTTP_CODE.UNAUTHORIZED, '用户不存在');
    }
    if (user.status === constants.USER_STATUS.DISABLED) {
      throw new CustomError(constants.HTTP_CODE.FORBIDDEN, '账号已被禁用');
    }
    ctx.data({
      msg: '获取用户信息成功',
      data: user.toSafeJSON()
    });
  }

  static async updateProfile(ctx) {
    const session = decodeToken(ctx);
    if (!session?._id) {
      throw new CustomError(constants.HTTP_CODE.UNAUTHORIZED, '未登录');
    }
    const allowed = ['nickname', 'bio', 'blog', 'location', 'avatar'];
    const body = ctx.request.body || {};
    const updates = {};
    allowed.forEach((key) => {
      if (body[key] !== undefined) updates[key] = body[key];
    });
    updates.lastModifiedDate = new Date();
    const user = await User.findByIdAndUpdate(session._id, updates, { new: true });
    ctx.data({
      msg: '资料已更新',
      data: user.toSafeJSON()
    });
  }

  static async health(ctx) {
    ctx.data({
      data: {
        ok: true,
        env: config.env,
        time: new Date().toISOString()
      }
    });
  }
}

AuthController.checkToken = checkToken;
AuthController.createToken = createToken;
AuthController.setTokenCookie = setTokenCookie;

module.exports = AuthController;
