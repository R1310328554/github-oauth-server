const BaseProvider = require('./base');
const config = require('../config');

/**
 * 小红书开放平台 OAuth 需企业资质与白名单，这里按统一接口实现，
 * 具体授权域名与字段以开放平台控制台最新文档为准。
 */
class XiaohongshuProvider extends BaseProvider {
  constructor() {
    super({
      id: 'xiaohongshu',
      name: '小红书',
      color: '#ff2442',
      icon: 'xiaohongshu',
      region: 'cn',
      description: '使用小红书开放平台账号登录（需企业接入）',
      scopes: [],
      clientId: config.providers.xiaohongshu.clientId,
      clientSecret: config.providers.xiaohongshu.clientSecret,
      authorizeUrl: 'https://ark.xiaohongshu.com/ark/authorization',
      tokenUrl: 'https://ark.xiaohongshu.com/ark/open_api/v1/oauth/token',
      userInfoUrl: 'https://ark.xiaohongshu.com/ark/open_api/v1/oauth/user_info'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      app_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      state
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        app_id: this.clientId,
        app_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }
    });
    const data = res.data?.data || res.data;
    if (!data?.access_token) {
      throw new Error(res.data?.msg || res.data?.message || 'Xiaohongshu token exchange failed');
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
    if (!user) {
      throw new Error(res.data?.msg || 'Xiaohongshu userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: user.open_id || user.user_id || user.uid,
      username: user.nickname || user.name,
      nickname: user.nickname || user.name,
      avatar: user.avatar || user.head_photo,
      ...user
    });
  }
}

module.exports = XiaohongshuProvider;
