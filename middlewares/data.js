module.exports = async function dataMiddleware(ctx, next) {
  ctx.data = function respond({ data, code, msg } = {}) {
    ctx.body = {
      success: code === undefined || code === 0,
      code: code || 0,
      msg: msg || 'ok',
      data: data === undefined ? {} : data
    };
  };
  await next();
};
