const BaseProvider = require('./base');
const config = require('../config');

class MetaProvider extends BaseProvider {
  constructor() {
    super({
      id: 'meta',
      name: 'Meta',
      color: '#0866ff',
      icon: 'meta',
      region: 'global',
      description: '使用 Meta / Facebook 账号登录',
      scopes: ['public_profile', 'email'],
      clientId: config.providers.meta.clientId,
      clientSecret: config.providers.meta.clientSecret,
      authorizeUrl: 'https://www.facebook.com/v21.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v21.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      state,
      scope: this.scopes.join(','),
      response_type: 'code'
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'GET',
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.callbackUrl,
        code
      }
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error?.message || 'Meta token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        fields: 'id,name,email,picture.type(large)',
        access_token: token.access_token
      }
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error?.message || 'Meta userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.id,
      username: res.data.name,
      nickname: res.data.name,
      avatar: res.data.picture?.data?.url || '',
      email: res.data.email || '',
      ...res.data
    });
  }
}

module.exports = MetaProvider;
