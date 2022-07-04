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
    const { code } = ctx.query;
    console.log('code----', code);
    const data = await getAccessToken(code, "weibo");
    // const data = {
    //   access_token: '2.00uMvXSBhQ1uDBf7392567e4BtqjME',
    //   remind_in: '157679999',
    //   expires_in: 157679999,
    //   uid: '1190191612',
    //   isRealName: 'true'
    // }
    // console.log('data', data);
    ctx.cookies.set('id', 1);
    if (data) {
      const userInfo =  await getUserInfo({access_token: data.access_token}, data.uid, "weibo");
      console.log('userInfo', userInfo);
      if (userInfo) {
        const {
          id, screen_name, profile_image_url, created_at, location
        } = userInfo;
        const hasUser = await User.findOneAndUpdate({
          userId: id
        }, {
          userId:id,
          username: screen_name,
          avatar: profile_image_url,
          createDate: created_at,
          location,
          lastLoginDate: Date.now()
        });
        let res;
        if (hasUser) {
          res = hasUser;
        } else {
          res = await new User({
            userId:id,
            username: screen_name,
            avatar: profile_image_url,
            location,
            userInfo: userInfo
          }).save();
        }
        if (res) {
          const jwtToken = createToken({
            _id: res._id,
            userId: res.userId,
            access_token: data.access_token,
            thirdType: 'weibo'
          });
          setTokenCookie(ctx, jwtToken);
          ctx.cookies.set(
            "thirdType", // name
            'weibo', // value
            {
              maxAge: 10 * 24 * 60 * 60 * 1000, // cookie有效时
              httpOnly: false,
              overwirte: true
            }
          );

          ctx.redirect(config.weiboOAth.redirect_uri);
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
