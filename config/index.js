module.exports = {
  ip: process.env.ip,
  port: process.env.PORT || 8999, // server端口
  routerBaseApi: '/v1', // 接口基础路径
  LIMIT: 16,
  githubOAth: {
    url: 'https://github.com/login/oauth/access_token',
    client_id: 'ee0e0710193b7cac1e68',
    client_secret: 'd544353486c9e083d9c7437187236e8f191c6632',
    redirect_uri: 'http://192.168.1.103:8080',
    userUrl: 'https://api.github.com/user'
  },
  weiboOAth: {
    url2: 'https://api.weibo.com/oauth2/access_token',
    url: 'https://api.weibo.com/oauth2/access_token?client_id=973886123&client_secret=3253f16e8324a73f6ede08c7405c0bad&grant_type=authorization_code&redirect_uri=http%3A%2F%2F192.168.1.103%3A8999%2Fv1%2Fweibo%2Fuser%2Flogin&code=',
    client_id: '973886123',
    client_secret: '3253f16e8324a73f6ede08c7405c0bad',
    redirect_uri: 'http://192.168.1.103:8080',
    redirect_uri2: 'http://192.168.1.103:8080/callback',
    get_uid: 'https://api.weibo.com/2/account/get_uid.json',
    userUrl: 'https://api.weibo.com/2/users/show.json?uid='
  },
  wechatOAth: {
    url: 'https://github.com/login/oauth/access_token',
    client_id: '7dd33c1a56813db7f797',
    client_secret: 'de51eecf4d0b887ee9ddbe13019d664d09a6150f',
    redirect_uri: 'http://192.168.1.103:8080',
    userUrl: 'https://api.github.com/user'
  },
  jwt: {
    tokenName: 'aimee-test-token',
    tokenSecret: '123456',
    expiresIn: '240h' // 10天有效期
  },
  mongo: {
    host: '127.0.0.1',
    database: 'aimeeTest2',
    port: 27017,
    user: '',
    password: '',
    rs_name: ''
  }
};
