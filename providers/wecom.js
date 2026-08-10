const BaseProvider = require('./base');
const config = require('../config');

/**
 * 企业微信网页扫码登录（企业内部应用 / 代开发应用）。
 * clientId = corpId, clientSecret = secret, extra.agentId = agentid
 */
class WeComProvider extends BaseProvider {
  constructor() {
    super({
      id: 'wecom',
      name: '企业微信',
      color: '#2b5aed',
      icon: 'wecom',
      region: 'cn',
      description: '使用企业微信扫码登录',
      scopes: ['snsapi_base'],
      clientId: config.providers.wecom.clientId,
      clientSecret: config.providers.wecom.clientSecret,
      authorizeUrl: 'https://login.work.weixin.qq.com/wwlogin/sso/login',
      tokenUrl: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      userInfoUrl: 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserinfo',
      extra: {
        agentId: config.providers.wecom.agentId
      }
    });
  }

  get enabled() {
    return Boolean(this.clientId && this.clientSecret && this.extra.agentId);
  }

  getAuthorizeUrl({ state }) {
    return this.buildAuthorizeUrl({
      login_type: 'CorpApp',
      appid: this.clientId,
      agentid: this.extra.agentId,
      redirect_uri: this.callbackUrl,
      state
    });
  }

  async exchangeCode({ code }) {
    const tokenRes = await this.http({
      url: this.tokenUrl,
      method: 'GET',
      params: {
        corpid: this.clientId,
        corpsecret: this.clientSecret
      }
    });
    if (!tokenRes.data?.access_token) {
      throw new Error(tokenRes.data?.errmsg || 'WeCom access_token failed');
    }

    const userRes = await this.http({
      url: this.userInfoUrl,
      method: 'GET',
      params: {
        access_token: tokenRes.data.access_token,
        code
      }
    });
    if (userRes.data?.errcode && userRes.data.errcode !== 0) {
      throw new Error(userRes.data?.errmsg || 'WeCom code exchange failed');
    }

    return {
      access_token: tokenRes.data.access_token,
      expires_in: tokenRes.data.expires_in,
      userid: userRes.data.userid,
      openid: userRes.data.openid,
      user_ticket: userRes.data.user_ticket
    };
  }

  async getUserProfile(token) {
    let detail = {
      userid: token.userid,
      openid: token.openid
    };

    if (token.userid) {
      const detailRes = await this.http({
        url: 'https://qyapi.weixin.qq.com/cgi-bin/user/get',
        method: 'GET',
        params: {
          access_token: token.access_token,
          userid: token.userid
        }
      });
      if (detailRes.data && detailRes.data.errcode === 0) {
        detail = { ...detail, ...detailRes.data };
      }
    } else if (token.user_ticket) {
      const detailRes = await this.http({
        url: 'https://qyapi.weixin.qq.com/cgi-bin/auth/getuserdetail',
        method: 'POST',
        params: { access_token: token.access_token },
        data: { user_ticket: token.user_ticket }
      });
      if (detailRes.data && detailRes.data.errcode === 0) {
        detail = { ...detail, ...detailRes.data };
      }
    }

    const id = detail.userid || detail.openid;
    return this.normalizeProfile({
      providerUserId: id,
      username: detail.name || detail.userid || detail.openid,
      nickname: detail.name || detail.userid || detail.openid,
      avatar: detail.avatar || detail.thumb_avatar || '',
      email: detail.email || detail.biz_mail || '',
      ...detail
    });
  }
}

module.exports = WeComProvider;
