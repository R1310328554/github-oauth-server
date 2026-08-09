const crypto = require('crypto');
const BaseProvider = require('./base');
const config = require('../config');

/**
 * Telegram Login Widget / oauth.telegram.org
 * clientId = bot id (numeric), clientSecret = bot token
 */
class TelegramProvider extends BaseProvider {
  constructor() {
    super({
      id: 'telegram',
      name: 'Telegram',
      color: '#229ed9',
      icon: 'telegram',
      region: 'global',
      description: '使用 Telegram 账号登录（Login Widget）',
      authType: 'telegram',
      clientId: config.providers.telegram.clientId,
      clientSecret: config.providers.telegram.clientSecret,
      authorizeUrl: 'https://oauth.telegram.org/auth',
      extra: {
        botUsername: config.providers.telegram.botUsername
      }
    });
  }

  get enabled() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getAuthorizeUrl({ state }) {
    const origin = new URL(config.frontendUrl).origin;
    return this.buildAuthorizeUrl({
      bot_id: this.clientId,
      origin,
      request_access: 'write',
      return_to: `${this.callbackUrl}?state=${encodeURIComponent(state)}`,
      lang: 'zh'
    });
  }

  // Telegram does not use authorization_code exchange.
  async exchangeCode() {
    throw new Error('Telegram uses signed login payload, not authorization code');
  }

  verifyLoginPayload(payload = {}) {
    const allowed = [
      'id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date'
    ];
    const hash = payload.hash;
    if (!hash) {
      throw new Error('缺少 Telegram hash');
    }

    const rest = {};
    allowed.forEach((key) => {
      if (payload[key] !== undefined && payload[key] !== null && payload[key] !== '') {
        rest[key] = payload[key];
      }
    });

    const checkString = Object.keys(rest)
      .sort()
      .map((key) => `${key}=${rest[key]}`)
      .join('\n');

    const secret = crypto.createHash('sha256').update(this.clientSecret).digest();
    const computed = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
    if (computed !== hash) {
      throw new Error('Telegram 登录签名校验失败');
    }

    const authDate = Number(rest.auth_date || 0);
    if (!authDate || Date.now() / 1000 - authDate > 86400) {
      throw new Error('Telegram 登录数据已过期');
    }

    return rest;
  }

  async getUserProfile(payload) {
    const data = payload.id ? payload : this.verifyLoginPayload(payload);
    const nickname = [data.first_name, data.last_name].filter(Boolean).join(' ');
    return this.normalizeProfile({
      providerUserId: data.id,
      username: data.username || `tg_${data.id}`,
      nickname: nickname || data.username || `tg_${data.id}`,
      avatar: data.photo_url || '',
      ...data
    });
  }
}

module.exports = TelegramProvider;
