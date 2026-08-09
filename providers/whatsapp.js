const BaseProvider = require('./base');
const config = require('../config');

/**
 * WhatsApp 没有面向网站的标准 OAuth「一键登录」。
 * 这里实现 Cloud API OTP 登录：向手机号发送验证码并校验后建会话。
 * clientId = phone_number_id, clientSecret = permanent access token
 */
class WhatsAppProvider extends BaseProvider {
  constructor() {
    super({
      id: 'whatsapp',
      name: 'WhatsApp',
      color: '#25d366',
      icon: 'whatsapp',
      region: 'global',
      description: '使用 WhatsApp 手机号验证码登录（Cloud API OTP）',
      authType: 'otp',
      clientId: config.providers.whatsapp.clientId,
      clientSecret: config.providers.whatsapp.clientSecret,
      authorizeUrl: `${config.frontendUrl.replace(/\/$/, '')}/#/login`,
      extra: {
        graphVersion: config.providers.whatsapp.graphVersion || 'v21.0'
      }
    });
  }

  get enabled() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getAuthorizeUrl({ state }) {
    // Front-end opens OTP panel; state is kept for bind/login continuity.
    return `${this.authorizeUrl}?provider=whatsapp&state=${encodeURIComponent(state)}`;
  }

  async exchangeCode() {
    throw new Error('WhatsApp uses OTP verification instead of authorization code');
  }

  async sendOtpMessage(phone, code) {
    const version = this.extra.graphVersion;
    const res = await this.http({
      url: `https://graph.facebook.com/${version}/${this.clientId}/messages`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.clientSecret}`,
        'Content-Type': 'application/json'
      },
      data: {
        messaging_product: 'whatsapp',
        to: String(phone).replace(/\D/g, ''),
        type: 'text',
        text: {
          preview_url: false,
          body: `Your Nexus Auth verification code is ${code}. It expires in 10 minutes.`
        }
      }
    });
    if (res.data?.error) {
      throw new Error(res.data.error.message || 'WhatsApp OTP send failed');
    }
    return res.data;
  }

  async getUserProfile({ phone }) {
    const normalized = String(phone).replace(/\D/g, '');
    return this.normalizeProfile({
      providerUserId: normalized,
      username: `wa_${normalized}`,
      nickname: `WhatsApp ${normalized.slice(-4)}`,
      avatar: '',
      phone: normalized
    });
  }
}

module.exports = WhatsAppProvider;
