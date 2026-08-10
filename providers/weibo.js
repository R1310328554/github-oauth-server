const BaseProvider = require('./base');
const config = require('../config');

class WeiboProvider extends BaseProvider {
  constructor() {
    super({
      id: 'weibo',
      name: '微博',
      color: '#e6162d',
      icon: 'weibo',
      region: 'cn',
      description: '使用微博账号登录',
      scopes: [],
      clientId: config.providers.weibo.clientId,
      clientSecret: config.providers.weibo.clientSecret,
      authorizeUrl: 'https://api.weibo.com/oauth2/authorize',
      tokenUrl: 'https://api.weibo.com/oauth2/access_token',
      userInfoUrl: 'https://api.weibo.com/2/users/show.json'
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
    const res = await this.http({
      url: this.tokenUrl,
      method: 'POST',
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.callbackUrl,
        code
      }
    });
    if (!res.data || res.data.error) {
      throw new Error(res.data?.error_description || res.data?.error || 'Weibo token exchange failed');
    }
    return res.data;
  }

  async getUserProfile(token) {
    const res = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        access_token: token.access_token,
        uid: token.uid
      }
    });
    if (!res.data || res.data.error_code) {
      throw new Error(res.data?.error || 'Weibo userinfo failed');
    }
    return this.normalizeProfile({
      providerUserId: res.data.id,
      username: res.data.screen_name,
      nickname: res.data.name || res.data.screen_name,
      avatar: res.data.avatar_hd || res.data.avatar_large || res.data.profile_image_url,
      email: '',
      bio: res.data.description,
      location: res.data.location,
      ...res.data
    });
  }
}

module.exports = WeiboProvider;
