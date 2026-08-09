const config = require('../config');

module.exports = async (ctx, next) => {
  const origin = ctx.get('Origin');
  const allowed = config.corsOrigins || [];
  if (origin && allowed.includes(origin)) {
    ctx.set('Access-Control-Allow-Origin', origin);
    ctx.set('Access-Control-Allow-Credentials', 'true');
  } else if (!origin && config.env === 'development') {
    ctx.set('Access-Control-Allow-Origin', '*');
  }

  ctx.set('Access-Control-Allow-Headers', 'Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With');
  ctx.set('Access-Control-Allow-Methods', 'PUT,PATCH,POST,GET,DELETE,OPTIONS');
  ctx.set('Access-Control-Max-Age', '1728000');
  ctx.set('Vary', 'Origin');

  if (ctx.request.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }

  await next();
};
