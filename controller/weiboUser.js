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

    ctx.cookies.set(
      "nowTime222", // name
      new Date(), // value
      {
        maxAge: 10 * 24 * 60 * 60 * 1000, // cookie有效时
        httpOnly: false,
        overwirte: false
      }
    );


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
      // const userInfo = {
      //   "id": 1190191612,
      //   "idstr": "1190191612",
      //   "class": 1,
      //   "screen_name": "Robert_90452",
      //   "name": "Robert_90452",
      //   "province": "11",
      //   "city": "1",
      //   "location": "北京 东城区",
      //   "description": "",
      //   "url": "",
      //   "profile_image_url": "https://tva1.sinaimg.cn/crop.0.0.720.720.50/46f0e1fcjw8ewv8d48lj5j20k00k040q.jpg?KID=imgbed,tva&Expires=1656768533&ssig=QNRGPgkV%2Bd",
      //   "light_ring": false,
      //   "cover_image_phone": "http://ww1.sinaimg.cn/crop.0.0.640.640.640/549d0121tw1egm1kjly3jj20hs0hsq4f.jpg",
      //   "profile_url": "u/1190191612",
      //   "domain": "",
      //   "weihao": "",
      //   "gender": "f",
      //   "followers_count": 50,
      //   "followers_count_str": "50",
      //   "friends_count": 240,
      //   "pagefriends_count": 26,
      //   "statuses_count": 1258,
      //   "video_status_count": 0,
      //   "video_play_count": 0,
      //   "favourites_count": 2,
      //   "created_at": "Sun Jul 07 21:55:28 +0800 2013",
      //   "following": false,
      //   "allow_all_act_msg": false,
      //   "geo_enabled": true,
      //   "verified": false,
      //   "verified_type": -1,
      //   "remark": "",
      //   "insecurity": {
      //     "sexual_content": false
      //   },
      //   "status": {
      //     "visible": {
      //       "type": 0,
      //       "list_id": 0
      //     },
      //     "created_at": "Tue Feb 25 13:06:01 +0800 2020",
      //     "id": 4475841197524802,
      //     "idstr": "4475841197524802",
      //     "mid": "4475841197524802",
      //     "can_edit": false,
      //     "show_additional_indication": 0,
      //     "text": "转发微博",
      //     "source_allowclick": 0,
      //     "source_type": 1,
      //     "source": "<a href=\"http://app.weibo.com/t/feed/c66T5g\" rel=\"nofollow\">Android客户端</a>",
      //     "favorited": false,
      //     "truncated": false,
      //     "in_reply_to_status_id": "",
      //     "in_reply_to_user_id": "",
      //     "in_reply_to_screen_name": "",
      //     "pic_urls": [],
      //     "geo": null,
      //     "is_paid": false,
      //     "mblog_vip_type": 0,
      //     "annotations": [
      //       {
      //         "client_mblogid": "58916374-5948-4eca-86c2-7fb4098b94f4"
      //       },
      //       {
      //         "mapi_request": true
      //       }
      //     ],
      //     "reposts_count": 0,
      //     "comments_count": 0,
      //     "reprint_cmt_count": 0,
      //     "attitudes_count": 0,
      //     "pending_approval_count": 0,
      //     "isLongText": false,
      //     "reward_exhibition_type": 0,
      //     "hide_flag": 0,
      //     "mlevel": 0,
      //     "biz_feature": 0,
      //     "hasActionTypeCard": 0,
      //     "darwin_tags": [],
      //     "hot_weibo_tags": [],
      //     "text_tag_tips": [],
      //     "mblogtype": 0,
      //     "rid": "0",
      //     "userType": 0,
      //     "more_info_type": 0,
      //     "positive_recom_flag": 0,
      //     "content_auth": 0,
      //     "gif_ids": "",
      //     "is_show_bulletin": 2,
      //     "comment_manage_info": {
      //       "comment_permission_type": -1,
      //       "approval_comment_type": 0,
      //       "comment_sort_type": 0
      //     },
      //     "repost_type": 1,
      //     "pic_num": 0,
      //     "reprint_type": 0,
      //     "can_reprint": false,
      //     "new_comment_style": 0
      //   },
      //   "ptype": 0,
      //   "allow_all_comment": true,
      //   "avatar_large": "https://tva1.sinaimg.cn/crop.0.0.720.720.180/46f0e1fcjw8ewv8d48lj5j20k00k040q.jpg?KID=imgbed,tva&Expires=1656768533&ssig=6fQwRTSfCn",
      //   "avatar_hd": "https://tva1.sinaimg.cn/crop.0.0.720.720.1024/46f0e1fcjw8ewv8d48lj5j20k00k040q.jpg?KID=imgbed,tva&Expires=1656768533&ssig=qDlLLEdvxW",
      //   "verified_reason": "",
      //   "verified_trade": "",
      //   "verified_reason_url": "",
      //   "verified_source": "",
      //   "verified_source_url": "",
      //   "follow_me": false,
      //   "like": false,
      //   "like_me": false,
      //   "online_status": 0,
      //   "bi_followers_count": 4,
      //   "lang": "zh-cn",
      //   "star": 0,
      //   "mbtype": 0,
      //   "mbrank": 0,
      //   "svip": 0,
      //   "mb_expire_time": 0,
      //   "block_word": 0,
      //   "block_app": 0,
      //   "chaohua_ability": 0,
      //   "brand_ability": 0,
      //   "nft_ability": 0,
      //   "vplus_ability": 0,
      //   "wenda_ability": 0,
      //   "live_ability": 0,
      //   "gongyi_ability": 0,
      //   "paycolumn_ability": 0,
      //   "credit_score": 80,
      //   "user_ability": 2097152,
      //   "urank": 9,
      //   "story_read_state": -1,
      //   "vclub_member": 0,
      //   "is_teenager": 0,
      //   "is_guardian": 0,
      //   "is_teenager_list": 0,
      //   "pc_new": 7,
      //   "special_follow": false,
      //   "planet_video": 0,
      //   "video_mark": 0,
      //   "live_status": 0,
      //   "user_ability_extend": 0,
      //   "status_total_counter": {
      //     "total_cnt": 40,
      //     "repost_cnt": 12,
      //     "comment_cnt": 7,
      //     "like_cnt": 21,
      //     "comment_like_cnt": 0
      //   },
      //   "video_total_counter": {
      //     "play_cnt": -1
      //   },
      //   "brand_account": 0,
      //   "hongbaofei": 0,
      //   "green_mode": 0
      // }
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
