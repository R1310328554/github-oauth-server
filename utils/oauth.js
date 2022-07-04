const axios = require('axios');
const tunnel = require('tunnel');
const {
  githubOAth, weiboOAth
} = require('../config');

// const proxy = 'http://127.0.0.1:1087';
const tunnelProxy = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: '1087'
  }
});
module.exports.getAccessToken = (code, thirdType) => new Promise(async (reslove) => {
  console.log('result--- weibo weibo weibo ', 88888);

  let oAuthCfg = githubOAth;
  let res;
  if (thirdType && thirdType == "weibo") {
    oAuthCfg = weiboOAth;
    let url2 = oAuthCfg.url + code
    res = await axios({
      url: url2,
      method: 'POST'
    }).then((res) => {
      // console.log('result--- aaaaaaaaaa ',  res);
      const { data } = res;
      if (data && !data.error) {
        reslove(data);
      } else {
        reslove(false);
      }

    }).catch((e) => {
      console.log('catch errrrrrrrrrrrrr ', e.message);
    });
  } else {
    const body = {
      client_id: oAuthCfg.client_id,
      client_secret: oAuthCfg.client_secret,
      code
    };
    res = await axios({
      url: oAuthCfg.url,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json'
      },
      // httpsAgent: tunnelProxy,
      data: body
    });

    console.log('res  ---', res);
    const { data } = res;
    if (data && !data.error) {
      reslove(data);
    } else {
      reslove(false);
    }
  }
}).catch((error)=>{
  console.log('我帮你处理了', error.message);
});

module.exports.getUserInfo = ({ access_token, token_type}, uid = "", thirdType) => {
  console.log(`${token_type} ${access_token}`);
  let oAuthCfg = githubOAth;
  let url = githubOAth.userUrl;
  if (thirdType && thirdType == 'weibo') {
    oAuthCfg = weiboOAth;
    url = oAuthCfg.userUrl + uid + "&access_token="+access_token
  //   const res = axios({
  //     method: 'GET',
  //     url: oAuthCfg.get_uid,
  //     headers: {
  //       Authorization: `Bearer ${access_token}`
  //     }
  //   });
  //   console.log('res----', res.uid);
  //   uid = res.uid;
  }
  return new Promise(async (reslove) => {
    const res = await axios({
      method: 'GET',
      url: url,
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }).catch((error)=>{
      console.log('获取用户信息异常 -- ', error);
    });
    if (res.data && !res.data.error) {
      reslove(res.data);
    } else {
      reslove(false);
    }
  });
};
