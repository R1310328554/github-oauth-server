const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = 'aes-256-gcm';

function deriveKey() {
  return crypto.createHash('sha256').update(String(config.tokenEncryptKey)).digest();
}

function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(payload) {
  if (!payload) return '';
  const [ivHex, tagHex, dataHex] = String(payload).split(':');
  if (!ivHex || !tagHex || !dataHex) return '';
  const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

function sha256Base64Url(value) {
  return crypto.createHash('sha256').update(value).digest('base64url');
}

module.exports = {
  encrypt,
  decrypt,
  randomToken,
  sha256Base64Url
};
