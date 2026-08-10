const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const config = require('./config');
const router = require('./router');
const mongodb = require('./mongodb');
const corsOpt = require('./middlewares/corsOpt');
const data = require('./middlewares/data');
const catchError = require('./middlewares/catch');
const securityHeaders = require('./middlewares/securityHeaders');
const createRateLimit = require('./middlewares/rateLimit');

async function bootstrap() {
  if (config.env === 'production' && config.jwt.tokenSecret.includes('dev-only')) {
    throw new Error('Production JWT_SECRET must be set to a strong random value');
  }

  await mongodb();

  const app = new Koa();
  app.proxy = true;

  app.use(securityHeaders);
  app.use(corsOpt);
  app.use(data);
  app.use(bodyParser({
    jsonLimit: '1mb',
    formLimit: '1mb'
  }));
  app.use(logger());
  app.use(createRateLimit({ prefix: 'all', max: 120 }));
  app.use(catchError);
  app.use(router.routes()).use(router.allowedMethods());

  app.listen(config.port, config.ip, () => {
    console.log(`OAuth Hub listening on ${config.appBaseUrl} (port ${config.port})`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
