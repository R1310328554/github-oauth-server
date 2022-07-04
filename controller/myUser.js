const { getAccessToken, getUserInfo } = require('../utils/oauth');
const constants = require('../utils/constants');
const {
  createToken, setTokenCookie, deleteTokenCookie, decodeToken
} = require('../utils/token');
const { CustomError } = require('../utils/customError');
const config = require('../config');
const User = require('../model/user');

class authController {
  static async login(ctx) {
    ctx.cookies.set('id', 1);

    console.log('ctx..request.body', ctx.request.body);
    let loginData = ctx.request.body || {}
    const user = await User.findOne({
      username: loginData.username
    });

    if (user) {
      const jwtToken = createToken({
        _id: user._id,
        userId: user.userId,
        access_token: user.username,
        thirdType: 'my'
      });
      setTokenCookie(ctx, jwtToken);
      ctx.cookies.set(
        "thirdType", // name
        'my', // value
        {
          maxAge: 10 * 24 * 60 * 60 * 1000, // cookie有效时
          httpOnly: false,
          overwirte: true
        }
      );
      ctx.data({ data: user });
    } else {
      ctx.data({
        code: 1001,
        msg: '获取用户信息失败！请检查登录信息或重新注册'
      });
    }
  }

  static logout(ctx) {
    deleteTokenCookie(ctx);
    ctx.data({});
  }

  static async getUserInfo(ctx) {
    const userObj = decodeToken(ctx);
    console.log('userObj', userObj);
    const result = await User.findOne({
      _id: userObj._id
    }).exec().catch(() => {
      throw new CustomError(500, '服务器内部错误');
    });
    // console.log('result', result);
    if (result) {
      const {
        _id,
        userId,
        username,
        status,
        avatar,
        userInfo,
      } = result;
      ctx.data({
        msg: '获取用户信息成功！',
        data: {
          _id,
          userId,
          username,
          status,
          avatar,
          userInfo,
        }
      });
    } else {
      ctx.data({
        code: 1001,
        msg: '获取用户信息失败！'
      });
    }
  }

  static async getAllUser(ctx) {
    const result = await User.find();
    ctx.data({ data: result });
  }
}

module.exports = authController;
