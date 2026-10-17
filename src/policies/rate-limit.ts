import { errors } from '@strapi/utils';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>()

export default async (policyContext: any, config: any, { strapi }: any) => {
  const maxRequests = config.max || 100;
  const windowMs = config.window || 60_000;

  const ip = policyContext.request?.ip || policyContext.ip || 'unknown';

  const userId = policyContext.state.user?.id;
  const path = policyContext.request?.path || policyContext.path || '';
  const key = `${userId ?? 'anon'}:${ip}:${path}`;

  const now = Date.now()
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true;
  }

  current.count += 1;

  if (current.count > maxRequests) {
    const retryAfterSec = Math.ceil((current.resetAt - now) / 1000);

    strapi.log.warn(`Rate limit exceeded for ${key} (${current.count}/${maxRequests})`)

    throw new errors.PolicyError('Too many requests', {
      policy: 'global::rate-limit',
      retryAfter: retryAfterSec,
      max: maxRequests,
      windowMs,
    })
  }

  return true;
}