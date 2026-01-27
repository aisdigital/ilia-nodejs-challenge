import { InMemoryRateLimiter, createRateLimiter } from '../rate-limiter.service';
import { RateLimitTiers } from '../rate-limiter.types';

describe('InMemoryRateLimiter', () => {
  let rateLimiter: InMemoryRateLimiter;

  afterEach(() => {
    rateLimiter?.destroy();
  });

  describe('checkLimit', () => {
    it('should allow requests under the limit', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 5,
        windowMs: 60_000,
      });

      const result = await rateLimiter.checkLimit('test-key');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should block requests over the limit', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 3,
        windowMs: 60_000,
      });

      // Use up all requests
      await rateLimiter.checkLimit('test-key');
      await rateLimiter.checkLimit('test-key');
      await rateLimiter.checkLimit('test-key');

      // This should be blocked
      const result = await rateLimiter.checkLimit('test-key');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different keys separately', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 60_000,
      });

      // Use up key1's limit
      await rateLimiter.checkLimit('key1');
      await rateLimiter.checkLimit('key1');
      const key1Result = await rateLimiter.checkLimit('key1');

      // Key2 should still be allowed
      const key2Result = await rateLimiter.checkLimit('key2');

      expect(key1Result.allowed).toBe(false);
      expect(key2Result.allowed).toBe(true);
      expect(key2Result.remaining).toBe(1);
    });

    it('should use keyPrefix in storage', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 5,
        windowMs: 60_000,
        keyPrefix: 'custom',
      });

      await rateLimiter.checkLimit('test');
      const status = rateLimiter.getStatus();

      expect(status.activeKeys).toBe(1);
    });
  });

  describe('resetLimit', () => {
    it('should reset limit for a key', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 60_000,
      });

      // Use up the limit
      await rateLimiter.checkLimit('test-key');
      await rateLimiter.checkLimit('test-key');

      // Reset
      await rateLimiter.resetLimit('test-key');

      // Should be allowed again
      const result = await rateLimiter.checkLimit('test-key');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('peekLimit', () => {
    it('should return remaining without incrementing', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 5,
        windowMs: 60_000,
      });

      await rateLimiter.checkLimit('test-key'); // 4 remaining
      
      const peek1 = await rateLimiter.peekLimit('test-key');
      const peek2 = await rateLimiter.peekLimit('test-key');

      expect(peek1).toBe(4);
      expect(peek2).toBe(4); // Still 4, not decremented
    });
  });

  describe('getStatus', () => {
    it('should return correct statistics', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 60_000,
      });

      await rateLimiter.checkLimit('key1');
      await rateLimiter.checkLimit('key1');
      await rateLimiter.checkLimit('key1'); // blocked
      await rateLimiter.checkLimit('key2');

      const status = rateLimiter.getStatus();

      expect(status.activeKeys).toBe(2);
      expect(status.totalRequests).toBe(4);
      expect(status.blockedRequests).toBe(1);
    });
  });

  describe('createRateLimiter factory', () => {
    it('should create limiter with STANDARD tier', () => {
      const limiter = createRateLimiter('STANDARD');
      const config = limiter.getConfig();

      expect(config.maxRequests).toBe(RateLimitTiers.STANDARD.maxRequests);
      expect(config.windowMs).toBe(RateLimitTiers.STANDARD.windowMs);

      limiter.destroy();
    });

    it('should create limiter with STRICT tier', () => {
      const limiter = createRateLimiter('STRICT');
      const config = limiter.getConfig();

      expect(config.maxRequests).toBe(RateLimitTiers.STRICT.maxRequests);
      expect(config.windowMs).toBe(RateLimitTiers.STRICT.windowMs);

      limiter.destroy();
    });

    it('should allow custom options to override tier', () => {
      const limiter = createRateLimiter('STANDARD', {
        maxRequests: 999,
      });
      const config = limiter.getConfig();

      expect(config.maxRequests).toBe(999);
      expect(config.windowMs).toBe(RateLimitTiers.STANDARD.windowMs);

      limiter.destroy();
    });
  });

  describe('sliding window behavior', () => {
    it('should allow requests after window slides', async () => {
      rateLimiter = new InMemoryRateLimiter({
        maxRequests: 2,
        windowMs: 100, // 100ms window for testing
      });

      // Use up the limit
      await rateLimiter.checkLimit('test-key');
      await rateLimiter.checkLimit('test-key');
      
      let result = await rateLimiter.checkLimit('test-key');
      expect(result.allowed).toBe(false);

      // Wait for window to slide
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      result = await rateLimiter.checkLimit('test-key');
      expect(result.allowed).toBe(true);
    });
  });
});
