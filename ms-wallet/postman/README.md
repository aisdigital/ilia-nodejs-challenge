# MS-Wallet Postman Collection

Production-ready collection to test the Wallet Microservice API endpoints.

## 🚀 Quick Start

### 1. Import Files in Postman

- `MS-Wallet.postman_collection.json`
- `MS-Wallet.postman_environment.json`

### 2. Select Environment

Choose **"MS-Wallet - Development"** from the environment dropdown.

### 3. Get a JWT Token

Before using MS-Wallet, you need a JWT token from MS-Users:

1. Import MS-Users collection from `../ms-users/postman/`
2. Run **"Register New User"** request
3. Token is automatically saved to `jwt_token` environment variable
4. `user_id` is also auto-saved for wallet operations

### 4. Start Testing

Run requests in this order for best results:

1. **Health Check** - Verify service is running
2. **Create CREDIT Transaction** - Add funds
3. **Get Balance** - Verify balance updated
4. **Create DEBIT Transaction** - Withdraw funds

## ✨ New Features

### Idempotency

All POST requests automatically generate a unique `Idempotency-Key` header:

```
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Benefits:**

- Prevents duplicate transactions on network retries
- Same key returns cached response (indicated by `x-idempotent-replayed: true` header)
- Keys expire after 24 hours

### Rate Limiting

Response headers show rate limit status:

| Header                  | Description                                  |
| ----------------------- | -------------------------------------------- |
| `X-RateLimit-Limit`     | Max requests per window (30 for STRICT tier) |
| `X-RateLimit-Remaining` | Remaining requests                           |
| `X-RateLimit-Reset`     | Unix timestamp when window resets            |

**429 Response**: Rate limit exceeded - wait for reset.

### Health Check Metrics

The `/health` endpoint now includes rate limiter metrics:

```json
{
  "checks": {
    "rateLimiter": {
      "rateLimit": {
        "ip": { "activeKeys": 5, "totalRequests": 150, "blockedRequests": 2 },
        "user": { "activeKeys": 3, "totalRequests": 100, "blockedRequests": 0 }
      },
      "backpressure": {
        "currentConcurrent": 10,
        "queueSize": 0,
        "isOverloaded": false
      }
    }
  }
}
```

## 📋 Available Endpoints

### Balance (Requires JWT)

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/balance?user_id=<uuid>` | Get user balance (O(1) lookup) |

### Transactions (Requires JWT)

| Method | Endpoint                                   | Description           |
| ------ | ------------------------------------------ | --------------------- |
| GET    | `/transactions?user_id=<uuid>`             | List all transactions |
| GET    | `/transactions?user_id=<uuid>&type=CREDIT` | Filter by type        |
| POST   | `/transactions`                            | Create transaction    |

### Health & Monitoring (No Auth)

| Method | Endpoint  | Description                           |
| ------ | --------- | ------------------------------------- |
| GET    | `/health` | Service health + rate limiter metrics |
| GET    | `/docs`   | Swagger/OpenAPI documentation         |

## 🔒 Authentication

All endpoints except `/health` and `/docs` require JWT Bearer token:

```
Authorization: Bearer <jwt_token>
```

The collection automatically includes this header using the `jwt_token` environment variable.

## 📝 Environment Variables

| Variable              | Description                                   | Auto-Set          |
| --------------------- | --------------------------------------------- | ----------------- |
| `base_url`            | API base URL (default: http://localhost:3001) | No                |
| `jwt_token`           | JWT token from MS-Users                       | Yes (after login) |
| `user_id`             | User ID for wallet operations                 | Yes (after login) |
| `idempotency_key`     | Auto-generated UUID for each POST             | Yes               |
| `last_transaction_id` | Last created transaction ID                   | Yes               |

## 🧪 Test Scenarios

### Happy Path

1. Register user in MS-Users
2. Create CREDIT transaction (add $100)
3. Get balance (should be $100)
4. Create DEBIT transaction (withdraw $50)
5. Get balance (should be $50)

### Idempotency Test

1. Create CREDIT transaction (note the `idempotency_key`)
2. Run "Retry - Same Idempotency Key" request
3. Verify same transaction ID returned
4. Check `x-idempotent-replayed: true` header

### Error Handling

- **Insufficient Balance**: Try DEBIT > current balance
- **Validation Error**: Invalid UUID or zero amount
- **Rate Limit**: Run multiple requests quickly

## 🔗 Links

- **API Docs**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **gRPC Port**: 50051 (internal communication)

## 📖 Full Documentation

For complete guide including Docker setup, troubleshooting, and CI/CD integration:

👉 **[POSTMAN.md](../../POSTMAN.md)** (project root)
