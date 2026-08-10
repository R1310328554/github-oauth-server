const BaseProvider = require('./base');
const config = require('../config');

class TikTokProvider extends BaseProvider {
  constructor() {
    super({
      id: 'tiktok',
      name: 'TikTok',
      color: '#010101',
      icon: 'tiktok',
      region: 'global',
      description: '使用 TikTok 账号登录',
      scopes: ['user.info.basic'],
      supportsPKCE: true,
      clientId: config.providers.tiktok.clientId,
      clientSecret: config.providers.tiktok.clientSecret,
      authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
      userInfoUrl: 'https://open.tiktokapis.com/v2/user/info/'
    });
  }

  getAuthorizeUrl({ state, codeChallenge }) {
    return this.buildAuthorizeUrl({
      client_key: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scopes.join(','),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
  }

  async exchangeCode({ code, codeVerifier }) {
    const body = new URLSearchParams({
      client_key: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.callbackUrl,
      code_verifier: codeVerifier || ''
    });
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body.toString()
    });
    const data = res.data?.data || res.data;
    if (!data?.access_token) {
      throw new Error(res.data?.error_description || res.data?.message || 'TikTok token exchange failed');
    }
    return data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`
      },
      params: {
        fields: 'open_id,union_id,avatar_url,display_name'
      }
    });
    const user = res.data?.data?.user || res.data?.user || res.data?.data;
    if (!user) {
      throw new Error(res.data?.error?.message || 'TikTok userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: user.open_id || user.union_id,
      username: user.display_name,
      nickname: user.display_name,
      avatar: user.avatar_url,
      ...user
    });
  }
}

module.exports = TikTokProvider;
