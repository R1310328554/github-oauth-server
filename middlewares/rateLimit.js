const config = require('../config');

// Lightweight in-memory rate limiter (per-process). Suitable for single-instance demos.
const buckets = new Map();

function hit(key, limit, windowMs) {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  return bucket;
}

module.exports = function createRateLimit(options = {}) {
  const max = options.max || config.rateLimit.max;
  const duration = options.duration || config.rateLimit.duration;
  const prefix = options.prefix || 'global';

  return async (ctx, next) => {
    const ip = ctx.ip || ctx.request.ip || 'unknown';
    const key = `${prefix}:${ip}:${ctx.path}`;
    const bucket = hit(key, max, duration);
    ctx.set('X-RateLimit-Limit', String(max));
    ctx.set('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    if (bucket.count > max) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        code: 429,
        msg: '请求过于频繁，请稍后再试',
        data: {}
      };
      return;
    }
    await next();
  };
};
