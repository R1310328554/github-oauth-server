const BaseProvider = require('./base');
const config = require('../config');

class WeChatProvider extends BaseProvider {
  constructor() {
    super({
      id: 'wechat',
      name: '微信',
      color: '#07c160',
      icon: 'wechat',
      region: 'cn',
      description: '使用微信开放平台网站应用登录',
      scopes: ['snsapi_login'],
      clientId: config.providers.wechat.clientId,
      clientSecret: config.providers.wechat.clientSecret,
      authorizeUrl: 'https://open.weixin.qq.com/connect/qrconnect',
      tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      userInfoUrl: 'https://api.weixin.qq.com/sns/userinfo'
    });
  }

  getAuthorizeUrl({ state }) {
    // WeChat appends #wechat_redirect
    return `${this.buildAuthorizeUrl({
      appid: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'snsapi_login',
      state
    })}#wechat_redirect`;
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'GET',
      params: {
        appid: this.clientId,
        secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }
    });
    if (!res.data || res.data.errcode) {
      throw new Error(res.data?.errmsg || 'WeChat token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        access_token: token.access_token,
        openid: token.openid
      }
    });
    if (!res.data || res.data.errcode) {
      throw new Error(res.data?.errmsg || 'WeChat userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.unionid || res.data.openid,
      username: res.data.nickname,
      nickname: res.data.nickname,
      avatar: res.data.headimgurl,
      location: [res.data.country, res.data.province, res.data.city].filter(Boolean).join(' '),
      ...res.data
    });
  }
}

module.exports = WeChatProvider;
