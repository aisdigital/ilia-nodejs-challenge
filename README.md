# ília - Code Challenge NodeJS
A two-service financial application built with Node.js. The wallet service handles transactions and balance calculations, while the users service manages authentication and acts as a gateway to the wallet.

![Architecture Diagram](diagram.png)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (comes with Docker)

### Running the Services

The easiest way to get everything running is with Docker:

```bash
docker-compose up
```

This starts both microservices with their respective databases:
- **Wallet Service**: http://localhost:3001
- **Users Service**: http://localhost:3002

Check if services are running:
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

### Local Development

If you prefer running locally without Docker:

```bash
# Wallet service
cd wallet-service
cp .env.example .env
npm install
npm run dev

# Users service (in another terminal)
cd user-service
cp .env.example .env
npm install
npm run dev
```

Both services need PostgreSQL running locally. Update the `DATABASE_URL` in each `.env` file to point to your local database.

### Available Scripts

In each service directory:

```bash
npm run dev              # Development server with hot reload
npm run build            # Compile TypeScript
npm start                # Run compiled code
npm test                 # Run tests
npm test:unit            # Unit tests only
npm test:e2e             # Integration tests only
```

## API Reference

### Wallet Service (3001)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/health` | Health check | No |
| POST | `/transactions` | Create transaction | Yes* |
| GET | `/transactions?user_id=X` | List user transactions | Yes* |
| GET | `/balance?user_id=X` | Get user balance | Yes* |

*Requires `INTERNAL_JWT_SECRET` (service-to-service calls only)

### Users Service (3002)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/health` | Health check | No |
| POST | `/auth/register` | Register user | No |
| POST | `/auth/login` | Login (returns JWT) | No |
| GET | `/users/me` | Get user profile + balance | Yes |
| POST | `/users/me/transactions` | Create transaction | Yes |
| GET | `/users/me/transactions` | List transactions | Yes |
| GET | `/users/me/balance` | Get balance | Yes |

*Requires `JWT_SECRET` (client authentication)

## Architecture

### Service Design

Each service is built with a three-layer architecture:

```
Request → Controller → Service → Repository → Database
```

- **Controller**: Validates input, handles HTTP
- **Service**: Business logic and orchestration
- **Repository**: Database queries
- **Tests**: Unit tests for services, integration tests for APIs

This separation makes testing isolated components straightforward.

### Database Model

Each service has its own PostgreSQL database—no shared tables:

```
Users Service          Wallet Service
  └── users            └── transactions
  └── wallet_outbox    └── wallet_users
```

The users service uses an **outbox table** to track when users are synced to the wallet service, ensuring eventual consistency if the wallet service is temporarily down.

The wallet service maintains a **local copy of user IDs** (`wallet_users` table) for validation before creating transactions.

### Service Communication

Services communicate via REST API with internal JWT authentication:
- Clients use the public `JWT_SECRET` environment variable
- Services use the internal `INTERNAL_JWT_SECRET` environment variable
- This prevents clients from spoofing internal calls

## Key Design Patterns

### 1. Outbox Pattern for Reliability

When a user registers:
1. User is created in the database
2. An event is inserted into the `wallet_outbox` table (same transaction)
3. The users service attempts to notify the wallet service
4. If successful → outbox event marked `COMPLETED`
5. If failed → event stays `PENDING` for async retry

Result: User creation never fails just because the wallet service is down. Eventual consistency is guaranteed.

### 2. Request Tracing with Correlation IDs

Every request gets a unique `X-Correlation-ID`. This ID flows through:
- All logs (structured JSON format)
- All service-to-service calls
- Database operations

This makes debugging distributed system issues much easier. You can track a single request across both services.

### 3. Logging with Sensitive Data Protection

The system uses structured JSON logging (Pino) with automatic redaction:
- Passwords, tokens, and authorization headers are never logged
- Each log entry includes the correlation ID
- Logs show request/response details without exposing secrets

### 4. Wallet User Directory

The wallet service doesn't trust incoming `user_id` parameters. Instead:
- Users service syncs new users to the wallet service
- Wallet service maintains a local `wallet_users` table
- All transaction requests validate against this local table

This prevents accidental (or malicious) transactions for non-existent users.

### 5. Transaction Amount Validation

Transaction amounts are stored as integers (representing cents). The system validates:
- Amounts don't exceed 32-bit signed integer limits (~$21.4 million)
- Clear error message if overflow would occur
- Future migration path to `numeric` or `bigint` for larger values

### 6. Type Safety Throughout

The codebase uses TypeScript and Zod schemas:
- Request validation with helpful error messages
- Transaction types (`CREDIT`/`DEBIT`) are enums, not strings
- Compile-time type checking prevents many runtime errors

### 7. Users Service as Gateway

The `/users/me/*` endpoints act as a gateway to the wallet service:

```
Client → Users Service → Wallet Service
         (validates JWT)   (internal call)
         └─ Returns combined user + wallet data
```

This provides clients a single entry point instead of needing to know about both services.

#### Why This Design?

The wallet service is **not exposed directly to clients**. Instead, all wallet operations go through the users service:

- **Client Authentication**: Clients authenticate with the users service using their `JWT_SECRET` token
- **User Isolation**: The JWT contains the user's ID, extracted by the users service middleware
- **Internal Routing**: The users service translates client requests to internal wallet service calls using `INTERNAL_JWT_SECRET`
- **No User ID Enumeration**: Clients cannot specify arbitrary `user_id` values in URLs—they only access their own data via `/users/me/*`

Example flow:
```
User logs in with email/password
  → Users Service validates credentials, returns JWT with user_id
  → Client calls GET /users/me/balance with JWT
  → Users Service extracts user_id from JWT (authenticated request)
  → Users Service calls Wallet Service with internal token: GET /balance?user_id={extracted_id}
  → Wallet Service validates internal token and returns balance
  → Users Service returns combined user profile + balance
```

**Security benefit**: Clients cannot accidentally (or maliciously) access another user's transactions. The wallet service only trusts calls from the users service (via internal JWT), and the users service only exposes data for the authenticated user.

## Environment Variables

### Wallet Service

```env
PORT=3001                                    # Service port
DATABASE_URL=postgresql://...                # Connection string
JWT_SECRET=                                  # (Not used - internal only)
INTERNAL_JWT_SECRET=                         # JWT secret for service-to-service auth
```

### Users Service

```env
PORT=3002                                    # Service port
DATABASE_URL=postgresql://...                # Connection string
JWT_SECRET=                                  # JWT secret for client authentication
INTERNAL_JWT_SECRET=                         # JWT secret for calling other services
WALLET_SERVICE_URL=http://wallet-service:3001
```

Copy `.env.example` to `.env` and adjust as needed. Never commit `.env` files—they contain secrets.

## Running Tests

```bash
# Run all tests
npm test

# Unit tests only (fast, no database needed)
npm test:unit

# Integration tests (needs Docker running)
npm test:e2e

# Watch mode during development
npm test:unit -- --watch
```

## API Testing with Postman

A complete **Postman collection** is included for testing all API endpoints:

📁 **File**: `postman/AIS Digital Challenge - By Alessandro Muniz.postman_collection.json`

### Using the Collection

1. Open Postman
2. Click **Import** → Select the collection file from `postman/` directory
3. The collection includes:
   - **Health checks** for both services
   - **Authentication endpoints** (register, login)
   - **User endpoints** (profile, balance, transactions)
   - **Wallet endpoints** (direct service calls)
   - **Pre-configured variables** that auto-populate after login (JWT token, user ID)

### Features

-  **Auto-populated JWT tokens** - Login requests automatically extract and save your JWT token for subsequent requests
-  **Organized by service** - Separate folders for User Service and Wallet Service endpoints
-  **Public & Private endpoints** - Clear separation between unauthenticated and authenticated routes
-  **Environment variables** - Uses Postman globals for `token` and `userID`

### Quick Start in Postman

1. Run `docker-compose up` to start services
2. Import the collection
3. Go to **User Service** → **Register** (or Login)
4. Click Send - your JWT token and user ID are automatically saved
5. All other requests will use your saved token automatically

## CI/CD Pipeline & Gitflow

This project follows the **Gitflow branching model** for organized development and deployment:

### Branch Strategy

- **`develop`** - Integration branch for features. Automatically tested on every push or pull request.
- **`main`** - Production-ready code. Tagged with version numbers. Deployed to production environments.
- **Feature branches** - Created from `develop` (e.g., `feature/wallet-endpoints`). Merged back via pull requests.

### Automated CI/CD Pipeline

GitHub Actions automatically runs on both `develop` and `main` branches:

1. **Test Job** (runs on all PRs and pushes)
   - Installs dependencies for both services
   - Runs unit tests (`npm run test:unit`)
   - Runs security audits (`npm audit`)
   - Fails the build if any tests fail or vulnerabilities are found

2. **Build Job** (runs only if tests pass)
   - Builds Docker images for both services
   - Tags images with commit SHA for traceability
   - Can be extended to push to container registry

## Project Structure

```
aisdigital-challenge/
├── docker-compose.yml          # Services & databases
├── wallet-service/
│   ├── src/
│   │   ├── controllers/        # HTTP handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Database access
│   │   ├── types/              # TypeScript types
│   │   ├── constants/          # Constants (enums, errors, etc)
│   │   ├── middleware/         # Auth, logging, validation
│   │   └── index.ts            # Express setup
│   ├── tests/
│   │   ├── services/           # Service unit tests
│   │   └── integration/        # API integration tests
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
└── user-service/
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── clients/            # External service clients
    │   ├── types/
    │   ├── constants/
    │   ├── middleware/
    │   └── index.ts
    ├── tests/
    ├── prisma/
    │   └── schema.prisma
    └── package.json
```

## Trade-offs & Decisions

### Decision: Storing User IDs Locally in Wallet Service

**Chosen**: Wallet service maintains its own `wallet_users` table.

**Why**:
- Validates transactions against known users
- Doesn't depend on users service availability
- Single source of truth for what users exist

**Trade-off**: Requires synchronization from users service.

---

## Future Improvements

### Circuit Breaker for Service Calls

Currently, if the wallet service is slow or down, the users service waits for a timeout. A circuit breaker would:
- Fail fast if the service is clearly down
- Avoid cascading failures
- Provide graceful degradation (e.g., return user profile without balance)

### Async Outbox Processing

The outbox pattern stores failed syncs, but there's no background job to retry them yet. This would:
- Automatically retry failed user syncs
- Ensure eventual consistency is actually achieved
- Reduce manual intervention

### OpenAPI/Swagger Documentation

Automated API documentation would help:
- New developers understand the API quickly
- Generate client libraries
- Have a living, auto-updated spec

### Single Repository Model

Currently using a monorepo. For larger teams, separate repos might be better:
- Independent deployment pipelines
- Clearer ownership boundaries
- Easier to restrict access per service

### Dedicated DevOps Repository

Docker configurations and Kubernetes manifests in a separate repo:
- Infrastructure as Code practices
- Easier to manage infrastructure changes
- Decoupled from service repositories

---

