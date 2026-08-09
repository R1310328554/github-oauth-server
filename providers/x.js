const BaseProvider = require('./base');
const config = require('../config');

class XProvider extends BaseProvider {
  constructor() {
    super({
      id: 'x',
      name: 'X',
      color: '#000000',
      icon: 'x',
      region: 'global',
      description: '使用 X（原 Twitter）账号登录',
      scopes: ['tweet.read', 'users.read', 'offline.access'],
      supportsPKCE: true,
      clientId: config.providers.x.clientId,
      clientSecret: config.providers.x.clientSecret,
      authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      userInfoUrl: 'https://api.twitter.com/2/users/me'
    });
  }

  getAuthorizeUrl({ state, codeChallenge }) {
    return this.buildAuthorizeUrl({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: this.scopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
  }

  async exchangeCode({ code, codeVerifier }) {
    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      code_verifier: codeVerifier || ''
    });
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`
      },
      data: body.toString()
    });
    if (!res.data?.access_token) {
      throw new Error(res.data?.error_description || res.data?.error || 'X token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url,description,location,url'
      }
    });
    const user = res.data?.data;
    if (!user?.id) {
      throw new Error(res.data?.detail || res.data?.title || 'X userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: user.id,
      username: user.username,
      nickname: user.name || user.username,
      avatar: user.profile_image_url,
      bio: user.description,
      blog: user.url,
      location: user.location,
      ...user
    });
  }
}

module.exports = XProvider;
