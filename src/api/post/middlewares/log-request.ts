import type { Core } from '@strapi/strapi';

interface LogRequestConfig {
  enabled?: boolean;
}

const logRequest: Core.MiddlewareFactory<LogRequestConfig> = (_, { strapi }) => {
  return async (ctx: any, next: any) => {
    const start = Date.now()
    strapi.log.info(
      `[POST API] ${ctx.method} ${ctx.url} - Start`
    );

    await next();

    const duration = Date.now() - start;

    strapi.log.info(
      `[POST API] ${ctx.method} ${ctx.url} - ${ctx.status} (${duration}ms)`
    );

  }
}

export default logRequest;
