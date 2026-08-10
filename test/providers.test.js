const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { listProviders, getProvider } = require('../providers');

describe('oauth providers registry', () => {
  it('lists all expected social providers', () => {
    const ids = listProviders().map((item) => item.id);
    for (const id of [
      'github', 'weibo', 'wechat', 'google', 'gmail', 'meta',
      'instagram', 'tiktok', 'douyin', 'bilibili', 'kuaishou', 'xiaohongshu',
      'qq', 'feishu', 'dingtalk', 'wecom', 'x', 'telegram', 'whatsapp'
    ]) {
      assert.ok(ids.includes(id), `missing provider ${id}`);
    }
  });

  it('marks telegram/whatsapp with non-oauth auth types', () => {
    assert.equal(getProvider('telegram').authType, 'telegram');
    assert.equal(getProvider('whatsapp').authType, 'otp');
    assert.equal(getProvider('x').supportsPKCE, true);
  });

  it('marks providers without credentials as disabled', () => {
    const github = getProvider('github');
    assert.equal(typeof github.enabled, 'boolean');
    assert.equal(github.enabled, Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET));
  });

  it('builds authorize urls with state', () => {
    // temporarily inject credentials for URL generation
    const google = getProvider('google');
    google.clientId = 'demo-client';
    google.clientSecret = 'demo-secret';
    const url = google.getAuthorizeUrl({ state: 'abc', codeChallenge: 'challenge' });
    assert.match(url, /accounts\.google\.com/);
    assert.match(url, /state=abc/);
    assert.match(url, /code_challenge=challenge/);
  });
});
