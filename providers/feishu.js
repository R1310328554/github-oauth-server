const BaseProvider = require('./base');
const config = require('../config');

class FeishuProvider extends BaseProvider {
  constructor() {
    super({
      id: 'feishu',
      name: '飞书',
      color: '#3370ff',
      icon: 'feishu',
      region: 'cn',
      description: '使用飞书 / Lark 账号登录',
      scopes: [],
      clientId: config.providers.feishu.clientId,
      clientSecret: config.providers.feishu.clientSecret,
      authorizeUrl: 'https://passport.feishu.cn/suite/passport/oauth/authorize',
      tokenUrl: 'https://passport.feishu.cn/suite/passport/oauth/token',
      userInfoUrl: 'https://passport.feishu.cn/suite/passport/oauth/userinfo'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      state
    });
  }

  async exchangeCode({ code }) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.callbackUrl
    });
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body.toString()
    });
    if (!res.data?.access_token) {
      throw new Error(res.data?.error_description || res.data?.msg || 'Feishu token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    });
    if (!res.data || res.data.code) {
      throw new Error(res.data?.msg || res.data?.error || 'Feishu userinfo failed');
    }
    const user = res.data.data || res.data;
    return this.normalizeProfile({
      providerUserId: user.open_id || user.user_id || user.union_id,
      username: user.en_name || user.name || user.email,
      nickname: user.name || user.en_name,
      avatar: user.avatar_url || user.avatar_big || user.avatar_thumb,
      email: user.email || user.enterprise_email || '',
      ...user
    });
  }
}

module.exports = FeishuProvider;
