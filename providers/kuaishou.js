const BaseProvider = require('./base');
const config = require('../config');

class KuaishouProvider extends BaseProvider {
  constructor() {
    super({
      id: 'kuaishou',
      name: '快手',
      color: '#ff4906',
      icon: 'kuaishou',
      region: 'cn',
      description: '使用快手开放平台账号登录',
      scopes: ['user_info'],
      clientId: config.providers.kuaishou.clientId,
      clientSecret: config.providers.kuaishou.clientSecret,
      authorizeUrl: 'https://open.kuaishou.com/oauth2/connect',
      tokenUrl: 'https://open.kuaishou.com/oauth2/access_token',
      userInfoUrl: 'https://open.kuaishou.com/openapi/user_info'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      app_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scopes.join(','),
      state
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'GET',
      params: {
        app_id: this.clientId,
        app_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }
    });
    if (!res.data || res.data.result !== 1) {
      throw new Error(res.data?.error_msg || 'Kuaishou token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        app_id: this.clientId,
        access_token: token.access_token
      }
    });
    const user = res.data?.user_info || res.data;
    if (!user || (res.data?.result !== undefined && res.data.result !== 1)) {
      throw new Error(res.data?.error_msg || 'Kuaishou userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: user.open_id || user.user_id,
      username: user.name || user.user_name,
      nickname: user.name || user.user_name,
      avatar: user.head || user.avatar,
      ...user
    });
  }
}

module.exports = KuaishouProvider;
