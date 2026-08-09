const mongoose = require('mongoose');

const oauthStateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true, index: true },
  provider: { type: String, required: true },
  codeVerifier: String,
  mode: { type: String, enum: ['login', 'bind'], default: 'login' },
  userId: String,
  returnTo: String,
  ip: String,
  userAgent: String,
  expiresAt: { type: Date, required: true },
  consumedAt: Date,
  createDate: { type: Date, default: Date.now }
});

oauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('oauth_state', oauthStateSchema, 'oauth_state');
