const BaseProvider = require('./base');
const config = require('../config');

class QQProvider extends BaseProvider {
  constructor() {
    super({
      id: 'qq',
      name: 'QQ',
      color: '#12b7f5',
      icon: 'qq',
      region: 'cn',
      description: '使用 QQ 互联账号登录',
      scopes: ['get_user_info'],
      clientId: config.providers.qq.clientId,
      clientSecret: config.providers.qq.clientSecret,
      authorizeUrl: 'https://graph.qq.com/oauth2.0/authorize',
      tokenUrl: 'https://graph.qq.com/oauth2.0/token',
      userInfoUrl: 'https://graph.qq.com/user/get_user_info'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      state,
      scope: this.scopes.join(',')
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'GET',
      params: {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.callbackUrl,
        fmt: 'json'
      }
    });
    if (!res.data?.access_token) {
      throw new Error(res.data?.error_description || res.data?.msg || 'QQ token exchange failed');
    }

    const openIdRes = await this.http({
      url: 'https://graph.qq.com/oauth2.0/me',
      method: 'GET',
      params: {
        access_token: res.data.access_token,
        fmt: 'json'
      }
    });
    const openid = openIdRes.data?.openid;
    if (!openid) {
      throw new Error('QQ openid fetch failed');
    }
    return {
      ...res.data,
      openid,
      unionid: openIdRes.data?.unionid
    };
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        access_token: token.access_token,
        oauth_consumer_key: this.clientId,
        openid: token.openid
      }
    });
    if (!res.data || Number(res.data.ret) !== 0) {
      throw new Error(res.data?.msg || 'QQ userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: token.unionid || token.openid,
      username: res.data.nickname,
      nickname: res.data.nickname,
      avatar: res.data.figureurl_qq_2 || res.data.figureurl_qq_1 || res.data.figureurl_2,
      ...res.data,
      openid: token.openid
    });
  }
}

module.exports = QQProvider;
