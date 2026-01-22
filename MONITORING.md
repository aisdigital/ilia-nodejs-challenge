# 📊 Monitoring and Logging System

## ✅ Complete Implementation

This document describes the structured monitoring and logging system implemented in the microservices.

---

## 🎯 What Was Implemented

### 1. **Centralized Logger with Pino**

- ✅ Structured logs in JSON format
- ✅ Configurable log levels (DEBUG, INFO, WARN, ERROR, FATAL)
- ✅ Automatic context (service, environment, version)
- ✅ Colored pretty print in development
- ✅ Timestamp in ISO 8601

### 2. **Request ID / Correlation ID**

- ✅ Unique ID for each HTTP request
- ✅ Propagation via `x-request-id` header
- ✅ Correlation between microservices
- ✅ Distributed request tracking

### 3. **Health Check Endpoints**

- ✅ `/health` - General service status
- ✅ `/ready` - Readiness probe (for Kubernetes)
- ✅ `/live` - Liveness probe (for Kubernetes)
- ✅ Database monitoring
- ✅ Memory metrics

---

## 📁 Created File Structure

```
ms-wallet/
└── src/
    └── shared/
        ├── utils/
        │   └── logger.ts              # Centralized logger
        └── plugins/
            ├── health-check.plugin.ts # Health checks
            └── request-context.plugin.ts # Request ID tracking

ms-users/
└── src/
    └── shared/
        ├── utils/
        │   └── logger.ts              # Centralized logger
        └── plugins/
            ├── health-check.plugin.ts # Health checks
            └── request-context.plugin.ts # Request ID tracking
```

---

## 🔧 How to Use

### **1. Logger in Services**

```typescript
import { loggers, logError } from './shared/utils/logger';

// Simple log
loggers.server.info('Server started');

// Log with context
loggers.database.info({
  message: 'Connection established',
  host: 'localhost',
  database: 'mydb',
});

// Error log with stack trace
try {
  // code
} catch (error) {
  logError(error, 'my_operation');
}
```

### **2. Available Loggers**

**MS-Wallet:**

- `loggers.database` - Database operations
- `loggers.grpc` - gRPC calls
- `loggers.transaction` - Transactions
- `loggers.server` - HTTP server
- `loggers.auth` - Authentication

**MS-Users:**

- `loggers.database` - Database operations
- `loggers.grpc` - gRPC client
- `loggers.user` - User operations
- `loggers.auth` - Authentication
- `loggers.server` - HTTP server

### **3. Health Check Endpoints**

#### `GET /health`

Returns general service status:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T18:30:00.000Z",
  "uptime": 123.456,
  "service": "ms-wallet",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "memory": {
      "used": 45,
      "free": 75,
      "total": 120,
      "percentage": 37
    },
    "grpc": {
      "status": "up",
      "port": 50051
    }
  }
}
```

- **200 OK** - Service healthy
- **503 Service Unavailable** - Service degraded

#### `GET /ready`

Readiness probe (ideal for Kubernetes):

```json
{
  "status": "ready",
  "timestamp": "2026-01-22T18:30:00.000Z"
}
```

- **200 OK** - Ready to receive traffic
- **503** - Not ready (e.g., database unavailable)

#### `GET /live`

Liveness probe:

```json
{
  "status": "alive",
  "timestamp": "2026-01-22T18:30:00.000Z",
  "uptime": 123.456
}
```

- **200 OK** - Process alive

### **4. Request ID / Correlation**

All HTTP requests receive a unique ID:

```bash
# Sending with custom Request ID
curl -H "x-request-id: my-custom-id-123" http://localhost:3001/health

# Response includes Request ID
HTTP/1.1 200 OK
x-request-id: my-custom-id-123
```

**Automatic logs:**

```json
{
  "level": "INFO",
  "timestamp": "2026-01-22T18:30:00.000Z",
  "service": "ms-wallet",
  "type": "http_response",
  "method": "GET",
  "url": "/health",
  "statusCode": 200,
  "responseTime": 15,
  "requestId": "my-custom-id-123"
}
```

---

## 📊 Log Format

### **Production Logs (JSON)**

```json
{
  "level": "INFO",
  "timestamp": "2026-01-22T18:30:00.000Z",
  "service": "ms-wallet",
  "environment": "production",
  "version": "1.0.0",
  "context": "database",
  "message": "Connection established",
  "host": "db-wallet",
  "database": "wallet_db"
}
```

### **Development Logs (Pretty Print)**

```
[18:30:00] INFO (ms-wallet/database): Connection established
    host: "db-wallet"
    database: "wallet_db"
```

---

## 🔍 How to Analyze Logs

### **1. Filter by Context**

```bash
# Only database logs
docker logs ms-wallet | grep '"context":"database"'

# Only gRPC logs
docker logs ms-wallet | grep '"context":"grpc"'
```

### **2. Filter by Level**

```bash
# Only errors
docker logs ms-wallet | grep '"level":"ERROR"'

# Warnings and errors
docker logs ms-wallet | grep -E '"level":"(WARN|ERROR)"'
```

### **3. Track Specific Request**

```bash
# Follow a request by Request ID
docker logs ms-wallet | grep '"requestId":"abc-123-def"'
```

### **4. Performance Analysis**

```bash
# Slow requests (> 1000ms)
docker logs ms-wallet | jq 'select(.responseTime > 1000)'
```

---

## 📈 Next Steps (Phase 2 - Optional)

### **Prometheus + Grafana**

1. Add `prom-client` for metrics
2. Expose `/metrics` endpoint
3. Collect metrics:
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - Database query time
   - gRPC call latency

### **Loki for Aggregation**

1. Add Loki to docker-compose
2. Configure Promtail for log shipping
3. Dashboards in Grafana

### **OpenTelemetry Tracing**

1. Add `@opentelemetry/api`
2. Automatic instrumentation
3. Distributed traces between microservices

---

## 🧪 Testing the System

```bash
# 1. Rebuild containers
docker-compose up --build -d

# 2. Check health
curl http://localhost:3001/health | jq
curl http://localhost:3002/health | jq

# 3. Make a request with Request ID
curl -H "x-request-id: test-123" \
     http://localhost:3001/health

# 4. View structured logs
docker logs ms-wallet --tail 20
docker logs ms-users --tail 20

# 5. Filter logs by type
docker logs ms-wallet | grep http_response
```

---

## 📋 Implementation Checklist

- ✅ Centralized logger (Pino)
- ✅ Structured JSON logs
- ✅ Pretty print in development
- ✅ Request ID tracking
- ✅ Service correlation
- ✅ Health check endpoints
- ✅ Readiness probes
- ✅ Liveness probes
- ✅ Memory metrics
- ✅ Database health check
- ✅ Improved error handling
- ✅ Startup logs
- ✅ Shutdown logs

---

## 🎓 Implemented Best Practices

1. **Structuring**: JSON logs for easy parsing
2. **Context**: Each log has service, environment, timestamp
3. **Correlation**: Request ID to track requests
4. **Levels**: DEBUG, INFO, WARN, ERROR, FATAL
5. **Child Loggers**: Specific contexts (database, grpc, etc)
6. **Performance**: Asynchronous logging (Pino is very fast)
7. **Kubernetes Ready**: Health probes implemented
8. **Error Handling**: Structured stack traces

---

## 📚 References

- [Pino Documentation](https://getpino.io/)
- [Fastify Logging](https://fastify.dev/docs/latest/Reference/Logging/)
- [12 Factor App - Logs](https://12factor.net/logs)
- [OpenTelemetry](https://opentelemetry.io/)
