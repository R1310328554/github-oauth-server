const BaseProvider = require('./base');
const config = require('../config');

class GoogleProvider extends BaseProvider {
  constructor(options = {}) {
    const isGmail = options.id === 'gmail';
    super({
      id: options.id || 'google',
      name: options.name || (isGmail ? 'Gmail' : 'Google'),
      color: isGmail ? '#ea4335' : '#4285f4',
      icon: options.icon || (isGmail ? 'gmail' : 'google'),
      region: 'global',
      description: isGmail
        ? '使用 Google / Gmail 账号登录（邮箱权限）'
        : '使用 Google 账号登录',
      scopes: isGmail
        ? ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly']
        : ['openid', 'email', 'profile'],
      supportsPKCE: true,
      clientId: config.providers.google.clientId,
      clientSecret: config.providers.google.clientSecret,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo'
    });
  }

  getAuthorizeUrl({ state, codeChallenge }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state,
      access_type: 'offline',
      include_granted_scopes: 'true',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
  }

  async exchangeCode({ code, codeVerifier }) {
    const params = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.callbackUrl,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier || ''
    });
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: params.toString()
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error_description || 'Google token exchange failed');
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
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error_description || 'Google userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.sub,
      username: res.data.email || res.data.name,
      nickname: res.data.name || res.data.email,
      avatar: res.data.picture,
      email: res.data.email,
      ...res.data
    });
  }
}

module.exports = GoogleProvider;
