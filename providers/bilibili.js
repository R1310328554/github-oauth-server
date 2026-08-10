const BaseProvider = require('./base');
const config = require('../config');

class BilibiliProvider extends BaseProvider {
  constructor() {
    super({
      id: 'bilibili',
      name: 'Bilibili',
      color: '#00a1d6',
      icon: 'bilibili',
      region: 'cn',
      description: '使用哔哩哔哩账号登录',
      scopes: [],
      clientId: config.providers.bilibili.clientId,
      clientSecret: config.providers.bilibili.clientSecret,
      authorizeUrl: 'https://account.bilibili.com/pc/account-pc/auth/oauth',
      tokenUrl: 'https://api.bilibili.com/x/account-oauth2/v1/token',
      userInfoUrl: 'https://api.bilibili.com/x/account-oauth2/v1/userinfo'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      return_url: this.callbackUrl,
      state,
      response_type: 'code'
    });
  }

  async exchangeCode({ code }) {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      code
    });
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body.toString()
    });
    const data = res.data?.data || res.data;
    if (!data?.access_token) {
      throw new Error(res.data?.message || 'Bilibili token exchange failed');
    }
    return data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });
    const user = res.data?.data || res.data;
    if (!user || res.data?.code) {
      // bilibili often uses code===0 for success
      if (res.data?.code !== 0 && res.data?.code !== undefined) {
        throw new Error(res.data?.message || 'Bilibili userinfo failed');
      }
    }
    return this.normalizeProfile({
      providerUserId: user.openid || user.mid || user.uid,
      username: user.name || user.uname,
      nickname: user.name || user.uname,
      avatar: user.face || user.avatar,
      ...user
    });
  }
}

module.exports = BilibiliProvider;
