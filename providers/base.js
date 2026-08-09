const { URLSearchParams } = require('url');
const axios = require('axios');
const config = require('../config');

class BaseProvider {
  constructor(options = {}) {
    this.id = options.id;
    this.name = options.name;
    this.color = options.color || '#334155';
    this.icon = options.icon || this.id;
    this.region = options.region || 'global';
    this.description = options.description || '';
    this.scopes = options.scopes || [];
    this.supportsPKCE = Boolean(options.supportsPKCE);
    // oauth | telegram | otp
    this.authType = options.authType || 'oauth';
    this.clientId = options.clientId || '';
    this.clientSecret = options.clientSecret || '';
    this.authorizeUrl = options.authorizeUrl;
    this.tokenUrl = options.tokenUrl;
    this.userInfoUrl = options.userInfoUrl;
    this.extra = options.extra || {};
  }

  get enabled() {
    return Boolean(this.clientId && this.clientSecret);
  }

  get callbackUrl() {
    return `${config.oauthCallbackBase}/${this.id}/callback`;
  }

  getPublicMeta() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      region: this.region,
      description: this.description,
      enabled: this.enabled,
      supportsPKCE: this.supportsPKCE,
      authType: this.authType,
      scopes: this.scopes
    };
  }

  buildAuthorizeUrl(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value));
      }
    });
    return `${this.authorizeUrl}?${query.toString()}`;
  }

  async http(options) {
    const response = await axios({
      timeout: 15000,
      validateStatus: () => true,
      ...options
    });
    return response;
  }

  normalizeProfile(raw = {}) {
    return {
      providerUserId: String(raw.providerUserId || ''),
      username: raw.username || '',
      nickname: raw.nickname || raw.username || '',
      avatar: raw.avatar || '',
      email: raw.email || '',
      bio: raw.bio || '',
      blog: raw.blog || '',
      location: raw.location || '',
      raw
    };
  }

  // subclasses implement:
  // getAuthorizeUrl({ state, codeChallenge, redirectUri })
  // exchangeCode({ code, codeVerifier, redirectUri })
  // getUserProfile(tokenPayload)
}

module.exports = BaseProvider;
