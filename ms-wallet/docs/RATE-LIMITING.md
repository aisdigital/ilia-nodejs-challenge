# Rate Limiting & Backpressure

## Overview

The ms-wallet implements a robust Rate Limiting and Backpressure system to protect the API against overload and abuse.

## Components

### 1. Rate Limiter (Sliding Window)

In-memory implementation using a sliding window algorithm for precise request rate control.

**Features:**

- Per-IP rate limiting
- Per-user rate limiting (JWT)
- Sliding window for precision
- Standard RFC headers (RateLimit-\*)
- Automatic memory cleanup

**Available Tiers:**

```typescript
const RateLimitTiers = {
  STANDARD: { maxRequests: 100, windowMs: 60_000 }, // 100 req/min
  STRICT: { maxRequests: 30, windowMs: 60_000 }, // 30 req/min (transactions)
  RELAXED: { maxRequests: 200, windowMs: 60_000 }, // 200 req/min
  BURST: { maxRequests: 10, windowMs: 1_000 }, // 10 req/sec
};
```

### 2. Backpressure Manager

Controls the number of requests being processed simultaneously.

**Features:**

- Concurrent request limit
- Queue for waiting requests
- Configurable queue timeout
- Rejection when queue is full
- Load metrics

## Configuration

Default configuration in `app.ts`:

```typescript
await app.register(
  createRateLimiterPlugin({
    tier: 'STRICT', // Tier for financial transactions
    perIp: true, // Limit per IP
    perUser: true, // Limit per authenticated user
    skipPaths: ['/health', '/ready', '/live', '/documentation'],
    enableHeaders: true, // RateLimit-* headers
    backpressure: {
      maxConcurrent: 100, // Max 100 simultaneous requests
      maxQueueSize: 50, // Max 50 in waiting queue
      queueTimeout: 30_000, // 30s queue timeout
      enabled: true,
    },
  })
);
```

## Response Headers

### Rate Limit Headers

```
RateLimit-Limit: 30
RateLimit-Remaining: 25
RateLimit-Reset: 45
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 45
```

### When Blocked (429)

```
Retry-After: 15
```

### When Overloaded (503)

```
Retry-After: 5
```

## Error Responses

### 429 Too Many Requests

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests from this IP address",
  "retryAfter": 15
}
```

### 503 Service Unavailable

```json
{
  "code": "SERVICE_OVERLOADED",
  "message": "Server is overloaded. Queue full (50/50). Please retry later."
}
```

## Monitoring

Rate limiter status is available at the `/health` endpoint:

```json
{
  "status": "healthy",
  "checks": {
    "rateLimiter": {
      "rateLimit": {
        "ip": {
          "activeKeys": 15,
          "totalRequests": 1250,
          "blockedRequests": 3
        },
        "user": {
          "activeKeys": 8,
          "totalRequests": 890,
          "blockedRequests": 1
        }
      },
      "backpressure": {
        "currentConcurrent": 45,
        "queueSize": 2,
        "isOverloaded": false,
        "totalProcessed": 5000,
        "totalQueued": 150,
        "totalRejected": 5,
        "totalTimeouts": 2
      }
    }
  }
}
```

## Programmatic Usage

### Access Rate Limiter in Handler

```typescript
app.get('/some-route', async (request, reply) => {
  // Check status
  const status = request.server.rateLimiter.getStatus();

  // Check if overloaded
  if (request.server.rateLimiter.backpressure.isOverloaded()) {
    // Take action (e.g., reduce processing)
  }

  // Reset limit for a specific user
  await request.server.rateLimiter.user.resetLimit('user-123');
});
```

### Create Custom Rate Limiter

```typescript
import { createRateLimiter } from './shared/middlewares/rate-limiter';

// Create with predefined tier
const limiter = createRateLimiter('STRICT');

// Create with custom configuration
const customLimiter = createRateLimiter('STANDARD', {
  maxRequests: 50,
  keyPrefix: 'api-key',
});
```

## Scalability

### Current Scenario (Single Instance)

- In-memory rate limiter is sufficient
- Low latency
- No external dependencies

### For Multiple Instances

To scale horizontally, replace `InMemoryRateLimiter` with:

1. **Redis** (recommended):
   - Use `@upstash/ratelimit` or custom implementation
   - Supports algorithms: sliding window, token bucket, fixed window
2. **PostgreSQL**:
   - `rate_limits` table with TTL
   - Use `SELECT FOR UPDATE SKIP LOCKED`
   - Cleanup via cron job

## Best Practices

1. **Financial Transactions**: Use STRICT tier (30 req/min)
2. **Balance Queries**: Use RELAXED tier (200 req/min)
3. **Public Endpoints**: Always rate limit by IP
4. **Internal APIs**: Consider skip or RELAXED tier
5. **Monitoring**: Alert when `blockedRequests` increases significantly

## Tests

```bash
# Run rate limiter tests
npm test -- --testPathPattern="rate-limiter"

# Run backpressure tests
npm test -- --testPathPattern="backpressure"
```
