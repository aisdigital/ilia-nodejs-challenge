export interface RateLimitConfig {
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  keyPrefix?: string;
  message?: string;
  skip?: (key: string) => boolean;
  keyGenerator?: (request: RateLimitRequest) => string;
}

export interface RateLimitRequest {
  ip: string;
  userId?: string;
  path: string;
  method: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export interface BackpressureConfig {
  /** Maximum concurrent requests */
  maxConcurrent: number;
  /** Maximum queue size for pending requests */
  maxQueueSize: number;
  /** Timeout for queued requests in milliseconds */
  queueTimeout: number;
  /** Enable/disable backpressure */
  enabled: boolean;
}

export interface BackpressureStatus {
  currentConcurrent: number;
  queueSize: number;
  isOverloaded: boolean;
}

export interface IRateLimiter {
  checkLimit(key: string): Promise<RateLimitResult>;
  resetLimit(key: string): Promise<void>;
  getStatus(): RateLimitStatus;
}

export interface RateLimitStatus {
  activeKeys: number;
  totalRequests: number;
  blockedRequests: number;
}

/** Rate limit tiers for different endpoints or user types */
export const RateLimitTiers = {
  /** Standard tier for regular API calls */
  STANDARD: {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
  },
  /** Strict tier for sensitive operations (transactions) */
  STRICT: {
    maxRequests: 30,
    windowMs: 60_000, // 1 minute
  },
  /** Relaxed tier for read-only operations */
  RELAXED: {
    maxRequests: 200,
    windowMs: 60_000, // 1 minute
  },
  /** Burst protection for very short windows */
  BURST: {
    maxRequests: 10,
    windowMs: 1_000, // 1 second
  },
} as const;

export type RateLimitTier = keyof typeof RateLimitTiers;
