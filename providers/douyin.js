const BaseProvider = require('./base');
const config = require('../config');

class DouyinProvider extends BaseProvider {
  constructor() {
    super({
      id: 'douyin',
      name: '抖音',
      color: '#111111',
      icon: 'douyin',
      region: 'cn',
      description: '使用抖音开放平台账号登录',
      scopes: ['user_info'],
      clientId: config.providers.douyin.clientId,
      clientSecret: config.providers.douyin.clientSecret,
      authorizeUrl: 'https://open.douyin.com/platform/oauth/connect',
      tokenUrl: 'https://open.douyin.com/oauth/access_token/',
      userInfoUrl: 'https://open.douyin.com/oauth/userinfo/'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_key: this.clientId,
      response_type: 'code',
      scope: this.scopes.join(','),
      redirect_uri: this.callbackUrl,
      state
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        client_key: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }
    });
    const data = res.data?.data || res.data;
    if (!data?.access_token) {
      throw new Error(res.data?.message || res.data?.data?.description || 'Douyin token exchange failed');
    }
    return data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        access_token: token.access_token,
        open_id: token.open_id
      }
    });
    const user = res.data?.data || res.data;
    if (!user || user.error_code) {
      throw new Error(user?.description || 'Douyin userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: user.open_id || token.open_id,
      username: user.nickname || user.union_id,
      nickname: user.nickname,
      avatar: user.avatar || user.avatar_larger,
      ...user
    });
  }
}

module.exports = DouyinProvider;
