const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const TelegramProvider = require('../providers/telegram');

describe('telegram signature verification', () => {
  it('accepts valid login payload and rejects tampering', () => {
    const provider = new TelegramProvider();
    provider.clientId = '123456';
    provider.clientSecret = '123456:ABCDEF-demo-bot-token';

    const payload = {
      id: '42',
      first_name: 'Ada',
      username: 'ada',
      auth_date: String(Math.floor(Date.now() / 1000))
    };
    const checkString = Object.keys(payload).sort().map((k) => `${k}=${payload[k]}`).join('\n');
    const secret = crypto.createHash('sha256').update(provider.clientSecret).digest();
    const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');

    const verified = provider.verifyLoginPayload({ ...payload, hash, state: 'should-be-ignored' });
    assert.equal(verified.id, '42');
    assert.equal(verified.username, 'ada');

    assert.throws(() => {
      provider.verifyLoginPayload({ ...payload, hash: 'deadbeef', state: 'x' });
    }, /签名校验失败/);
  });
});
