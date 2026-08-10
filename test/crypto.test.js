const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { encrypt, decrypt, randomToken, sha256Base64Url } = require('../utils/crypto');

describe('crypto helpers', () => {
  it('encrypts and decrypts round-trip', () => {
    const plain = 'oauth-access-token-demo';
    const enc = encrypt(plain);
    assert.notEqual(enc, plain);
    assert.equal(decrypt(enc), plain);
  });

  it('creates url-safe random tokens and sha256 challenges', () => {
    const verifier = randomToken(32);
    assert.ok(verifier.length > 20);
    const challenge = sha256Base64Url(verifier);
    assert.ok(challenge.length > 20);
    assert.equal(challenge.includes('+'), false);
  });
});
