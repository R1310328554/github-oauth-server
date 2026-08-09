const GitHubProvider = require('./github');
const WeiboProvider = require('./weibo');
const WeChatProvider = require('./wechat');
const GoogleProvider = require('./google');
const MetaProvider = require('./meta');
const InstagramProvider = require('./instagram');
const TikTokProvider = require('./tiktok');
const DouyinProvider = require('./douyin');
const BilibiliProvider = require('./bilibili');
const KuaishouProvider = require('./kuaishou');
const XiaohongshuProvider = require('./xiaohongshu');

const providers = [
  new GitHubProvider(),
  new WeiboProvider(),
  new WeChatProvider(),
  new GoogleProvider({ id: 'google', name: 'Google', icon: 'google' }),
  new GoogleProvider({ id: 'gmail', name: 'Gmail', icon: 'gmail' }),
  new MetaProvider(),
  new InstagramProvider(),
  new TikTokProvider(),
  new DouyinProvider(),
  new BilibiliProvider(),
  new KuaishouProvider(),
  new XiaohongshuProvider()
];

const providerMap = providers.reduce((acc, provider) => {
  acc[provider.id] = provider;
  return acc;
}, {});

function listProviders({ onlyEnabled = false } = {}) {
  return providers
    .map((provider) => provider.getPublicMeta())
    .filter((item) => (onlyEnabled ? item.enabled : true));
}

function getProvider(id) {
  return providerMap[id] || null;
}

module.exports = {
  providers,
  listProviders,
  getProvider
};
