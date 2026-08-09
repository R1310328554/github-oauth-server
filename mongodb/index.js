const mongoose = require('mongoose');
const { mongo, env } = require('../config');

let memoryServer = null;

const getUrl = (config) => {
  if (config.uri) return config.uri;
  const {
    user, password, host, port, database
  } = config;
  let mongoUrl = 'mongodb://';
  if (user) {
    mongoUrl += `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`;
  }
  mongoUrl += `${host}:${port}/${database}`;
  return mongoUrl;
};

async function startMemoryMongo() {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  return memoryServer.getUri('oauth_hub');
}

module.exports = async () => {
  mongoose.set('strictQuery', true);
  let mongoUrl = getUrl(mongo);

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 2000
    });
  } catch (error) {
    if (env === 'production') {
      console.error('数据库连接失败：', error.message);
      throw error;
    }
    console.warn('无法连接外部 MongoDB，改用内存数据库（仅开发演示）');
    mongoUrl = await startMemoryMongo();
    await mongoose.connect(mongoUrl);
  }

  const db = mongoose.connection;
  db.on('error', (err) => {
    console.error('数据库连接出错！', err.message);
  });
  db.once('open', () => {
    console.log('数据库连接成功！');
  });

  return mongoose;
};

module.exports.stopMemoryMongo = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};
