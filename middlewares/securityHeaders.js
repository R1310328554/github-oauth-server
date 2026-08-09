module.exports = async (ctx, next) => {
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.set('X-Frame-Options', 'DENY');
  ctx.set('Referrer-Policy', 'no-referrer');
  ctx.set('X-XSS-Protection', '0');
  ctx.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (ctx.secure || ctx.get('x-forwarded-proto') === 'https') {
    ctx.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  await next();
};
