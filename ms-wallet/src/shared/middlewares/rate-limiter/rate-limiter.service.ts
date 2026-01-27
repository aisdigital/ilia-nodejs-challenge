/**
 * In-Memory Rate Limiter using Sliding Window Algorithm
 * 
 * This implementation uses a sliding window log approach for accurate
 * rate limiting without Redis. Suitable for single-instance deployments
 * or moderate traffic volumes.
 * 
 * For distributed systems, this can be extended to use Redis or PostgreSQL
 * as the backing store.
 */

import {
  RateLimitConfig,
  RateLimitResult,
  RateLimitInfo,
  IRateLimiter,
  RateLimitStatus,
  RateLimitTiers,
} from './rate-limiter.types';

export class InMemoryRateLimiter implements IRateLimiter {
  private store: Map<string, RateLimitInfo> = new Map();
  private requestLog: Map<string, number[]> = new Map();
  private config: Required<Omit<RateLimitConfig, 'skip' | 'keyGenerator'>>;
  private stats = {
    totalRequests: 0,
    blockedRequests: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? RateLimitTiers.STANDARD.maxRequests,
      windowMs: config.windowMs ?? RateLimitTiers.STANDARD.windowMs,
      keyPrefix: config.keyPrefix ?? 'rl',
      message: config.message ?? 'Too many requests, please try again later',
    };

    this.startCleanup();
  }

  /**
   * Check if a request is allowed under the rate limit
   * Uses sliding window log algorithm for accuracy
   */
  async checkLimit(key: string): Promise<RateLimitResult> {
    const prefixedKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    this.stats.totalRequests++;

    let timestamps = this.requestLog.get(prefixedKey) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter(ts => ts > windowStart);

    const currentCount = timestamps.length;

    if (currentCount >= this.config.maxRequests) {
      this.stats.blockedRequests++;

      // Calculate retry after based on oldest timestamp in window
      const oldestInWindow = timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + this.config.windowMs - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        resetTime: oldestInWindow + this.config.windowMs,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    timestamps.push(now);
    this.requestLog.set(prefixedKey, timestamps);

    this.store.set(prefixedKey, {
      count: timestamps.length,
      resetTime: now + this.config.windowMs,
    });

    return {
      allowed: true,
      remaining: this.config.maxRequests - timestamps.length,
      resetTime: now + this.config.windowMs,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  async resetLimit(key: string): Promise<void> {
    const prefixedKey = `${this.config.keyPrefix}:${key}`;
    this.store.delete(prefixedKey);
    this.requestLog.delete(prefixedKey);
  }

  getStatus(): RateLimitStatus {
    return {
      activeKeys: this.store.size,
      totalRequests: this.stats.totalRequests,
      blockedRequests: this.stats.blockedRequests,
    };
  }

  /**
   * Get remaining requests for a key without incrementing
   */
  async peekLimit(key: string): Promise<number> {
    const prefixedKey = `${this.config.keyPrefix}:${key}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const timestamps = this.requestLog.get(prefixedKey) || [];
    const validTimestamps = timestamps.filter(ts => ts > windowStart);

    return Math.max(0, this.config.maxRequests - validTimestamps.length);
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60_000);

    // Don't prevent Node.js from exiting
    this.cleanupInterval.unref();
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    for (const [key, timestamps] of this.requestLog.entries()) {
      // Filter out old timestamps
      const validTimestamps = timestamps.filter(ts => ts > windowStart);

      if (validTimestamps.length === 0) {
        this.requestLog.delete(key);
        this.store.delete(key);
      } else {
        this.requestLog.set(key, validTimestamps);
      }
    }
  }

  /**
   * Stop the cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): typeof this.config {
    return { ...this.config };
  }
}

/**
 * Create rate limiter instances for different tiers
 */
export function createRateLimiter(
  tier: keyof typeof RateLimitTiers,
  options: Partial<RateLimitConfig> = {}
): InMemoryRateLimiter {
  const tierConfig = RateLimitTiers[tier];
  return new InMemoryRateLimiter({
    ...tierConfig,
    ...options,
  });
}
