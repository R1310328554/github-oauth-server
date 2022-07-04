const mongoose = require('mongoose');

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

// {
//   login: 'Aimee1608',
//   id: 21167450,
//   node_id: 'MDQ6VXNlcjIxMTY3NDUw',
//   avatar_url: 'https://avatars.githubusercontent.com/u/21167450?v=4',
//   gravatar_id: '',
//   url: 'https://api.github.com/users/Aimee1608',
//   html_url: 'https://github.com/Aimee1608',
//   followers_url: 'https://api.github.com/users/Aimee1608/followers',
//   following_url: 'https://api.github.com/users/Aimee1608/following{/other_user}',
//   gists_url: 'https://api.github.com/users/Aimee1608/gists{/gist_id}',
//   starred_url: 'https://api.github.com/users/Aimee1608/starred{/owner}{/repo}',
//   subscriptions_url: 'https://api.github.com/users/Aimee1608/subscriptions',
//   organizations_url: 'https://api.github.com/users/Aimee1608/orgs',
//   repos_url: 'https://api.github.com/users/Aimee1608/repos',
//   events_url: 'https://api.github.com/users/Aimee1608/events{/privacy}',
//   received_events_url: 'https://api.github.com/users/Aimee1608/received_events',
//   type: 'User',
//   site_admin: false,
//   name: 'Aimee',
//   company: null,
//   blog: 'http://mangoya.cn/',
//   location: null,
//   email: 'shuigongqian@sina.com',
//   hireable: true,
//   bio: 'Write the Code. Change the World.',
//   twitter_username: null,
//   public_repos: 53,
//   public_gists: 0,
//   followers: 102,
//   following: 1,
//   created_at: '2016-08-22T06:07:35Z',
//   updated_at: '2021-07-27T14:30:13Z'
// }
const userSchema = new mongoose.Schema({
  // oid: {
  //   type: String,
  //   required: false
  // },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: false
  },
  nickname: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    required: false
  },
  blog: {
    type: String,
    required: false
  },
  userInfo: {
    type: Object,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  // 发布日期
  createDate: {
    type: Date,
    default: Date.now()
  },
  // 最后修改日期
  lastModifiedDate: {
    type: Date,
    default: Date.now()
  },
  lastLoginDate: {
    type: Date,
    default: Date.now()
  },
  status: {
    type: Number,
    required: true,
    default: 3
  } // 用户权限 3为普通用户 2为管理员 1为超级管理员
});

// mongoose 会自动把表名变成复数
// 想要指定collection的名称，需要设置第三个参数
// mongoose.model 执行在数据库创建表的操作
module.exports = mongoose.model('user', userSchema, 'user');
