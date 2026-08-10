const BaseProvider = require('./base');
const config = require('../config');

class GitHubProvider extends BaseProvider {
  constructor() {
    super({
      id: 'github',
      name: 'GitHub',
      color: '#24292f',
      icon: 'github',
      region: 'global',
      description: '使用 GitHub 账号登录',
      scopes: ['read:user', 'user:email'],
      supportsPKCE: false,
      clientId: config.providers.github.clientId,
      clientSecret: config.providers.github.clientSecret,
      authorizeUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user'
    });
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: this.scopes.join(' '),
      state,
      allow_signup: 'true'
    });
  }

  async exchangeCode({ code }) {
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.callbackUrl
      }
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error_description || 'GitHub token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'oauth-hub'
      }
    });
    if (!res.data || res.data.message) {
      throw new Error(res.data?.message || 'GitHub userinfo failed');
    }

    let email = res.data.email || '';
    if (!email) {
      const emailRes = await this.http({
        url: 'https://api.github.com/user/emails',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'oauth-hub'
        }
      });
      if (Array.isArray(emailRes.data)) {
        const primary = emailRes.data.find((item) => item.primary && item.verified)
          || emailRes.data.find((item) => item.verified)
          || emailRes.data[0];
        email = primary?.email || '';
      }
    }

    return this.normalizeProfile({
      providerUserId: res.data.id,
      username: res.data.login,
      nickname: res.data.name || res.data.login,
      avatar: res.data.avatar_url,
      email,
      bio: res.data.bio,
      blog: res.data.blog,
      location: res.data.location,
      ...res.data
    });
  }
}

module.exports = GitHubProvider;
