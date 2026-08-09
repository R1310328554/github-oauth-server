const BaseProvider = require('./base');
const config = require('../config');

class DingTalkProvider extends BaseProvider {
  constructor() {
    super({
      id: 'dingtalk',
      name: '钉钉',
      color: '#0089ff',
      icon: 'dingtalk',
      region: 'cn',
      description: '使用钉钉账号登录',
      scopes: ['openid', 'corpid'],
      clientId: config.providers.dingtalk.clientId,
      clientSecret: config.providers.dingtalk.clientSecret,
      authorizeUrl: 'https://login.dingtalk.com/oauth2/auth',
      tokenUrl: 'https://api.dingtalk.com/v1.0/oauth2/userAccessToken',
      userInfoUrl: 'https://api.dingtalk.com/v1.0/contact/users/me'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      client_id: this.clientId,
      scope: 'openid',
      state,
      prompt: 'consent'
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        code,
        grantType: 'authorization_code'
      }
    });
    if (!res.data?.accessToken) {
      throw new Error(res.data?.message || 'DingTalk token exchange failed');
    }
    return {
      access_token: res.data.accessToken,
      refresh_token: res.data.refreshToken,
      expires_in: res.data.expireIn,
      corpId: res.data.corpId
    };
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        'x-acs-dingtalk-access-token': token.access_token
      }
    });
    if (!res.data?.openId && !res.data?.unionId) {
      throw new Error(res.data?.message || 'DingTalk userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.unionId || res.data.openId,
      username: res.data.nick || res.data.mobile || res.data.openId,
      nickname: res.data.nick,
      avatar: res.data.avatarUrl,
      email: res.data.email || '',
      ...res.data
    });
  }
}

module.exports = DingTalkProvider;
