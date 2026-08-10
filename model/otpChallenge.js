const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema({
  provider: { type: String, required: true, default: 'whatsapp' },
  phone: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  state: String,
  mode: { type: String, enum: ['login', 'bind'], default: 'login' },
  userId: String,
  returnTo: String,
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: true },
  consumedAt: Date,
  createDate: { type: Date, default: Date.now }
});

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('otp_challenge', otpChallengeSchema, 'otp_challenge');
