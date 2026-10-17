import { Core } from "@strapi/strapi";

interface RequestTimerConfig {
  enabled?: boolean;
}

const requestTimer: Core.MiddlewareFactory<RequestTimerConfig> = (_, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();
    
    await next();

    const duration = Date.now() - start;
    ctx.set('X-Response-Time', `${duration}ms`);
  }
}

export default requestTimer;
