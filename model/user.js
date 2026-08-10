const mongoose = require('mongoose');

const providerAccountSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  providerUserId: { type: String, required: true },
  username: String,
  nickname: String,
  avatar: String,
  email: String,
  profile: { type: Object, default: {} },
  accessTokenEnc: String,
  refreshTokenEnc: String,
  tokenExpiresAt: Date,
  linkedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now }
}, { _id: false });

const loginHistorySchema = new mongoose.Schema({
  provider: String,
  ip: String,
  userAgent: String,
  at: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: { type: String, required: false, index: true },
  nickname: String,
  avatar: String,
  email: { type: String, index: true },
  bio: String,
  blog: String,
  location: String,
  passwordHash: { type: String, select: false },
  providers: { type: [providerAccountSchema], default: [] },
  loginHistory: { type: [loginHistorySchema], default: [] },
  createDate: { type: Date, default: Date.now },
  lastModifiedDate: { type: Date, default: Date.now },
  lastLoginDate: { type: Date, default: Date.now },
  status: {
    type: Number,
    required: true,
    default: 3 // 1 super admin, 2 admin, 3 user, 9 disabled
  }
});

userSchema.index({ 'providers.provider': 1, 'providers.providerUserId': 1 }, { unique: true, sparse: true });

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    userId: this.userId,
    username: this.username,
    nickname: this.nickname,
    avatar: this.avatar,
    email: this.email,
    bio: this.bio,
    blog: this.blog,
    location: this.location,
    status: this.status,
    providers: (this.providers || []).map((item) => ({
      provider: item.provider,
      providerUserId: item.providerUserId,
      username: item.username,
      nickname: item.nickname,
      avatar: item.avatar,
      email: item.email,
      linkedAt: item.linkedAt,
      lastLoginAt: item.lastLoginAt
    })),
    loginHistory: (this.loginHistory || []).slice(-10),
    createDate: this.createDate,
    lastLoginDate: this.lastLoginDate
  };
};

module.exports = mongoose.model('user', userSchema, 'user');
