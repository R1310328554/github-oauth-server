const Router = require('koa-router');
const config = require('../config');
const { checkToken } = require('../utils/token');
const createRateLimit = require('../middlewares/rateLimit');

const oauth = require('../controller/oauth');
const auth = require('../controller/auth');
const user = require('../controller/user');

const router = new Router({
  prefix: config.routerBaseApi
});

const authLimit = createRateLimit({ prefix: 'auth', max: 30, duration: 60 * 1000 });
const oauthLimit = createRateLimit({ prefix: 'oauth', max: 40, duration: 60 * 1000 });

router.get('/health', auth.health);

// Unified auth
router.post('/auth/register', authLimit, auth.register);
router.post('/auth/login', authLimit, auth.login);
router.post('/my/user/login', authLimit, auth.login); // backward compatible
router.get('/auth/logout', auth.logout);
router.get('/my/user/logout', auth.logout);
router.get('/auth/me', checkToken, auth.me);
router.get('/my/user/getUserInfo', checkToken, auth.me);
router.get('/github/user/getUserInfo', checkToken, auth.me);
router.get('/weibo/user/getUserInfo', checkToken, auth.me);
router.patch('/auth/profile', checkToken, auth.updateProfile);

// OAuth providers
router.get('/oauth/providers', oauth.list);
router.post('/oauth/whatsapp/otp/send', oauthLimit, oauth.whatsappSendOtp);
router.post('/oauth/whatsapp/otp/verify', oauthLimit, oauth.whatsappVerifyOtp);
router.get('/oauth/:provider/authorize', oauthLimit, oauth.authorize);
router.get('/oauth/:provider/callback', oauthLimit, oauth.callback);
router.delete('/oauth/:provider/unbind', checkToken, oauth.unbind);

// Legacy callback paths
router.get('/github/user/login', oauthLimit, oauth.legacyGithubLogin);
router.get('/weibo/user/login', oauthLimit, oauth.legacyWeiboLogin);
router.get('/github/user/logout', checkToken, auth.logout);
router.get('/weibo/user/logout', checkToken, auth.logout);

// Admin users
router.get('/users', checkToken, user.list);
router.get('/users/stats', checkToken, user.stats);
router.get('/my/user/getAllUser', checkToken, user.list);
router.get('/github/user/getAllUser', checkToken, user.list);
router.get('/weibo/user/getAllUser', checkToken, user.list);
router.patch('/users/:userId/status', checkToken, user.setStatus);

module.exports = router;
