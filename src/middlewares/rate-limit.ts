import { Core } from "@strapi/strapi";

interface RateLimitConfig {
  enabled?: boolean;
  max?: number;
  window?: number;
}

const requestCounts = new Map()

const rateLimit: Core.MiddlewareFactory<RateLimitConfig> = (config, { strapi }) => {
  const maxRequests = config.max || 100;
  const windowMs = config.window || 60 * 1000;

  return async (ctx, next) => {
    const ip = ctx.ip;
    const now = Date.now();
    const key = `${ip}`;

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      const record = requestCounts.get(key);
      if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs
      } else {
        record.count++;
      }

      if (record.count > maxRequests) {
        ctx.status = 429;
        ctx.body = {
          error: {
            status: 429,
            name: 'TooManyRequestsError',
            message: 'Rate limit exceeded. Try again later.'
          },
        };
        return;
      }
    }
    await next();
  }
}

export default rateLimit;
