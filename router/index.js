const Router = require('koa-router');
const config = require('../config');
const {
  checkToken
} = require('../utils/token');

const router = new Router({
  prefix: config.routerBaseApi // 设置接口基础路径
});

const githubUser = require('../controller/githubUser');
const weiboUser = require('../controller/weiboUser');

router.get('/github/user/login', githubUser.login);
router.get('/github/user/logout', checkToken, githubUser.logout);
router.get('/github/user/getUserInfo', checkToken, githubUser.getUserInfo);
router.get('/github/user/getAllUser', githubUser.getAllUser);

router.get('/weibo/user/login', weiboUser.login);
router.get('/weibo/user/logout', checkToken, weiboUser.logout);
router.get('/weibo/user/getUserInfo', checkToken, weiboUser.getUserInfo);
router.get('/weibo/user/getAllUser', weiboUser.getAllUser);

module.exports = router;
