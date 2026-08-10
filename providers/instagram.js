const BaseProvider = require('./base');
const config = require('../config');

class InstagramProvider extends BaseProvider {
  constructor() {
    super({
      id: 'instagram',
      name: 'Instagram',
      color: '#e1306c',
      icon: 'instagram',
      region: 'global',
      description: '使用 Instagram 账号登录（Meta Instagram Login）',
      scopes: ['instagram_business_basic'],
      clientId: config.providers.instagram.clientId,
      clientSecret: config.providers.instagram.clientSecret,
      authorizeUrl: 'https://www.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      userInfoUrl: 'https://graph.instagram.com/me'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scopes.join(','),
      state
    });
  }

  async exchangeCode({ code }) {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl,
      code
    });
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body.toString()
    });
    const data = res.data?.access_token ? res.data : res.data?.data?.[0];
    if (!data || !data.access_token) {
      throw new Error(res.data?.error_message || 'Instagram token exchange failed');
    }
    return data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        fields: 'id,username,account_type,profile_picture_url',
        access_token: token.access_token
      }
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error?.message || 'Instagram userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.id || token.user_id,
      username: res.data.username,
      nickname: res.data.username,
      avatar: res.data.profile_picture_url || '',
      ...res.data
    });
  }
}

module.exports = InstagramProvider;
