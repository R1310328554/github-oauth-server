const { getAccessToken, getUserInfo } = require('../utils/oauth');
const constants = require('../utils/constants');
const {
  createToken, setTokenCookie, deleteTokenCookie, decodeToken
} = require('../utils/token');
const { CustomError } = require('../utils/customError');
const config = require('../config');
const GithubUser = require('../model/user');

class authController {
  static async login(ctx) {
    const { code } = ctx.query;
    console.log('code----', code);
    const token = await getAccessToken(code);
    console.log('token', token);
    ctx.cookies.set('id', 1);
    if (token) {
      const userInfo = await getUserInfo(token);
      console.log('userInfo', userInfo);
      if (userInfo) {
        const {
          id: userId, name: nickname, login: username, avatar_url: avatar, email, bio, blog, id
        } = userInfo;
        const hasUser = await GithubUser.findOneAndUpdate({
          userId: id
        }, {
          userId,
          username,
          nickname,
          avatar,
          blog,
          bio,
          userInfo: userInfo,
          lastLoginDate: Date.now()
        });
        let res;
        if (hasUser) {
          res = hasUser;
        } else {
          res = await new GithubUser({
            userId,
            username,
            avatar,
            email,
            bio,
            blog,
            userInfo: userInfo
          }).save();
        }
        if (res) {
          const jwtToken = createToken({
            _id: res._id,
            userId: res.userId,
            access_token: token.access_token,
            thirdType: 'github'
          });

          setTokenCookie(ctx, jwtToken);
          ctx.cookies.set(
            "thirdType", // name
            'github', // value
            {
              maxAge: 10 * 24 * 60 * 60 * 1000, // cookie有效时
              httpOnly: false,
              overwirte: true
            }
          );

          setTokenCookie(ctx, jwtToken);
          ctx.redirect(config.githubOAth.redirect_uri);
          return;
        }
      }
    }
    ctx.data({
      code: constants.HTTP_CODE.UNAUTHORIZED,
      msg: '登录失败'
    });
  }

  static logout(ctx) {
    deleteTokenCookie(ctx);
    ctx.data({});
  }

  static async getUserInfo(ctx) {
    const userObj = decodeToken(ctx);
    console.log('userObj', userObj);
    const result = await GithubUser.findOne({
      _id: userObj._id
    }).exec().catch(() => {
      throw new CustomError(500, '服务器内部错误');
    });
    console.log('result', result);
    if (result) {
      const {
        _id,
        userId,
        username,
        status,
        avatar,
        userInfo
      } = result;
      ctx.data({
        msg: '获取用户信息成功！',
        data: {
          _id,
          userId,
          username,
          status,
          avatar,
          userInfo
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
    const result = await GithubUser.find();
    ctx.data({ data: result });
  }
}

module.exports = authController;
