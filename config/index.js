require('dotenv').config();

const toList = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const bool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const port = Number(process.env.PORT || 8999);
const appBaseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
const oauthCallbackBase = process.env.OAUTH_CALLBACK_BASE || `${appBaseUrl}/v1/oauth`;

const providerEnv = (idKey, secretKey) => ({
  clientId: process.env[idKey] || '',
  clientSecret: process.env[secretKey] || ''
});

module.exports = {
  env: process.env.NODE_ENV || 'development',
  ip: process.env.IP || process.env.ip || '0.0.0.0',
  port,
  appBaseUrl,
  frontendUrl,
  routerBaseApi: '/v1',
  corsOrigins: toList(process.env.CORS_ORIGINS, [frontendUrl, 'http://127.0.0.1:8080']),
  jwt: {
    tokenName: process.env.COOKIE_NAME || 'nexus_auth_token',
    tokenSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cookie: {
    secure: bool(process.env.COOKIE_SECURE, false),
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  tokenEncryptKey: process.env.TOKEN_ENCRYPT_KEY || 'dev-only-token-encrypt-key-change-me!!',
  oauthCallbackBase,
  mongo: {
    uri: process.env.MONGO_URI || '',
    host: process.env.MONGO_HOST || '127.0.0.1',
    database: process.env.MONGO_DATABASE || 'oauth_hub',
    port: Number(process.env.MONGO_PORT || 27017),
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || ''
  },
  providers: {
    github: providerEnv('GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'),
    weibo: providerEnv('WEIBO_CLIENT_ID', 'WEIBO_CLIENT_SECRET'),
    wechat: {
      clientId: process.env.WECHAT_APP_ID || '',
      clientSecret: process.env.WECHAT_APP_SECRET || ''
    },
    google: providerEnv('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'),
    gmail: providerEnv('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'),
    meta: {
      clientId: process.env.META_APP_ID || '',
      clientSecret: process.env.META_APP_SECRET || ''
    },
    instagram: {
      clientId: process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || '',
      clientSecret: process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || ''
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_KEY || '',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || ''
    },
    douyin: {
      clientId: process.env.DOUYIN_CLIENT_KEY || '',
      clientSecret: process.env.DOUYIN_CLIENT_SECRET || ''
    },
    bilibili: providerEnv('BILIBILI_CLIENT_ID', 'BILIBILI_CLIENT_SECRET'),
    kuaishou: {
      clientId: process.env.KUAISHOU_APP_ID || '',
      clientSecret: process.env.KUAISHOU_APP_SECRET || ''
    },
    xiaohongshu: {
      clientId: process.env.XHS_APP_KEY || '',
      clientSecret: process.env.XHS_APP_SECRET || ''
    }
  },
  rateLimit: {
    duration: 60 * 1000,
    max: 60
  }
};
