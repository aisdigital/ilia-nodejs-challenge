/**
 * Rate Limiter Fastify Plugin
 * 
 * Integrates rate limiting and backpressure into Fastify.
 * 
 * Features:
 * - Per-IP rate limiting (sliding window)
 * - Per-user rate limiting (when authenticated)
 * - Per-endpoint rate limiting
 * - Backpressure for concurrent request control
 * - Standard rate limit headers (RateLimit-*, Retry-After)
 */

import { FastifyInstance, FastifyPluginCallback, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { InMemoryRateLimiter, createRateLimiter } from './rate-limiter.service';
import { BackpressureManager, BackpressureError } from './backpressure.service';
import {
  RateLimitConfig,
  RateLimitTier,
  RateLimitTiers,
  BackpressureConfig,
} from './rate-limiter.types';

export interface RateLimiterPluginOptions {
  /** Global rate limit configuration */
  global?: Partial<RateLimitConfig>;
  /** Rate limit tier to use */
  tier?: RateLimitTier;
  /** Enable per-IP rate limiting */
  perIp?: boolean;
  /** Enable per-user rate limiting (requires JWT) */
  perUser?: boolean;
  /** Backpressure configuration */
  backpressure?: Partial<BackpressureConfig>;
  /** Paths to skip rate limiting */
  skipPaths?: string[];
  /** Enable rate limit headers */
  enableHeaders?: boolean;
  /** Trust proxy for IP detection */
  trustProxy?: boolean;
}

// Augment Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    rateLimiter: {
      ip: InMemoryRateLimiter;
      user: InMemoryRateLimiter;
      backpressure: BackpressureManager;
      getStatus: () => {
        rateLimit: { ip: ReturnType<InMemoryRateLimiter['getStatus']>; user: ReturnType<InMemoryRateLimiter['getStatus']> };
        backpressure: ReturnType<BackpressureManager['getStats']>;
      };
    };
  }
}

const DEFAULT_OPTIONS: RateLimiterPluginOptions = {
  tier: 'STANDARD',
  perIp: true,
  perUser: true,
  skipPaths: ['/health', '/ready', '/live', '/documentation'],
  enableHeaders: true,
  trustProxy: false,
  backpressure: {
    maxConcurrent: 100,
    maxQueueSize: 50,
    queueTimeout: 30_000,
    enabled: true,
  },
};

const rateLimiterPlugin: FastifyPluginCallback<RateLimiterPluginOptions> = (
  fastify: FastifyInstance,
  options: RateLimiterPluginOptions,
  done: (err?: Error) => void
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const tierConfig = RateLimitTiers[opts.tier || 'STANDARD'];

  // Create rate limiters
  const ipRateLimiter = createRateLimiter(opts.tier || 'STANDARD', {
    keyPrefix: 'ip',
    ...opts.global,
  });

  const userRateLimiter = createRateLimiter(opts.tier || 'STANDARD', {
    keyPrefix: 'user',
    ...opts.global,
  });

  // Create backpressure manager
  const backpressure = new BackpressureManager(opts.backpressure);

  // Expose rate limiter on fastify instance
  fastify.decorate('rateLimiter', {
    ip: ipRateLimiter,
    user: userRateLimiter,
    backpressure,
    getStatus: () => ({
      rateLimit: {
        ip: ipRateLimiter.getStatus(),
        user: userRateLimiter.getStatus(),
      },
      backpressure: backpressure.getStats(),
    }),
  });

  // Helper to get client IP
  const getClientIp = (request: FastifyRequest): string => {
    if (opts.trustProxy) {
      const forwarded = request.headers['x-forwarded-for'];
      if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ips.trim();
      }
    }
    return request.ip;
  };

  const getUserId = (request: FastifyRequest): string | undefined => {
    try {
      const decoded = request.user as { user_id?: string } | undefined;
      return decoded?.user_id;
    } catch {
      return undefined;
    }
  };

  const addRateLimitHeaders = (
    reply: FastifyReply,
    remaining: number,
    resetTime: number,
    limit: number
  ): void => {
    if (!opts.enableHeaders) return;

    const resetSeconds = Math.ceil((resetTime - Date.now()) / 1000);
    
    reply.header('RateLimit-Limit', limit.toString());
    reply.header('RateLimit-Remaining', Math.max(0, remaining).toString());
    reply.header('RateLimit-Reset', resetSeconds.toString());
    
    // Also add X- prefixed headers for compatibility
    reply.header('X-RateLimit-Limit', limit.toString());
    reply.header('X-RateLimit-Remaining', Math.max(0, remaining).toString());
    reply.header('X-RateLimit-Reset', resetSeconds.toString());
  };

  // Pre-handler hook for rate limiting
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (opts.skipPaths?.some(path => request.url.startsWith(path))) {
      return;
    }

    // 1. Apply backpressure
    let releaseBackpressure: (() => void) | undefined;
    try {
      releaseBackpressure = await backpressure.acquire();
      // Store release function for later
      (request as any).__releaseBackpressure = releaseBackpressure;
    } catch (error) {
      if (error instanceof BackpressureError) {
        reply.header('Retry-After', '5');
        return reply.status(503).send({
          code: error.code,
          message: error.message,
        });
      }
      throw error;
    }

    // 2. Check IP rate limit
    if (opts.perIp) {
      const clientIp = getClientIp(request);
      const ipResult = await ipRateLimiter.checkLimit(clientIp);

      addRateLimitHeaders(
        reply,
        ipResult.remaining,
        ipResult.resetTime,
        tierConfig.maxRequests
      );

      if (!ipResult.allowed) {
        reply.header('Retry-After', ipResult.retryAfter?.toString() || '60');
        return reply.status(429).send({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP address',
          retryAfter: ipResult.retryAfter,
        });
      }
    }

    // 3. Check user rate limit (if authenticated)
    if (opts.perUser) {
      const userId = getUserId(request);
      if (userId) {
        const userResult = await userRateLimiter.checkLimit(userId);

        // Update headers with stricter limit if user limit is lower
        if (userResult.remaining < (reply.getHeader('RateLimit-Remaining') as number || Infinity)) {
          addRateLimitHeaders(
            reply,
            userResult.remaining,
            userResult.resetTime,
            tierConfig.maxRequests
          );
        }

        if (!userResult.allowed) {
          reply.header('Retry-After', userResult.retryAfter?.toString() || '60');
          return reply.status(429).send({
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests for this user',
            retryAfter: userResult.retryAfter,
          });
        }
      }
    }
  });

  // Release backpressure slot after response
  fastify.addHook('onResponse', async (request: FastifyRequest) => {
    const release = (request as any).__releaseBackpressure;
    if (typeof release === 'function') {
      release();
    }
  });

  // Also release on error to prevent leaks
  fastify.addHook('onError', async (request: FastifyRequest) => {
    const release = (request as any).__releaseBackpressure;
    if (typeof release === 'function') {
      release();
    }
  });

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    ipRateLimiter.destroy();
    userRateLimiter.destroy();
    backpressure.clearQueue();
  });

  done();
};

export const rateLimiterPluginWithOptions = fp(rateLimiterPlugin, {
  name: 'rate-limiter',
  fastify: '5.x',
});

export function createRateLimiterPlugin(options: RateLimiterPluginOptions = {}) {
  return async (fastify: FastifyInstance) => {
    await fastify.register(rateLimiterPluginWithOptions, options);
  };
}
