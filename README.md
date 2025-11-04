# ília - Code Challenge NodeJS

## Overview

This project implements a microservices-based financial application with three services:

- **MS Users** (Port 3002): User management microservice with authentication
- **MS Wallet** (Port 3001): Digital wallet microservice for managing user transactions
- **MS Wallet Consumer**: Kafka consumer service that processes user events and maintains a local user cache

The services communicate asynchronously via Kafka messaging and use separate PostgreSQL databases.

## Architecture

The implementation follows Clean Architecture principles with four distinct layers:

- **Domain Layer**: Business entities and repository interfaces
- **Application Layer**: Use cases and DTOs
- **Infrastructure Layer**: Database, messaging, and external service implementations
- **Presentation Layer**: HTTP controllers and request/response DTOs

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Messaging**: Apache Kafka (KafkaJS)
- **Authentication**: JWT with Passport
- **Containerization**: Docker and Docker Compose

### Communication Flow

1. User creation triggers an event in MS Users
2. Event is published to Kafka topic `user-events`
3. MS Wallet Consumer processes the event and caches user data locally
4. MS Wallet uses the cached user data for transaction validation

### Consumer Architecture

The MS Wallet Consumer is a standalone Node.js service that:
- Listens to user events from Kafka
- Maintains a local cache of user data in the wallet database
- Implements retry logic with exponential backoff
- Sends failed messages to a Dead Letter Queue after max retries
- Ensures eventual consistency between services

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

## Project Structure

```
ilia-nodejs-challenge/
├── ms-users/              # User management microservice
│   ├── src/
│   │   ├── domain/        # Entities and repository interfaces
│   │   ├── application/   # Use cases and DTOs
│   │   ├── infrastructure/# Database, Kafka, JWT implementations
│   │   └── presentation/  # Controllers and request/response DTOs
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── package.json
├── ms-wallet/             # Transaction management microservice
│   ├── src/
│   │   ├── domain/        # Entities and repository interfaces
│   │   ├── application/   # Use cases and DTOs
│   │   ├── infrastructure/# Database, JWT implementations
│   │   └── presentation/  # Controllers and request/response DTOs
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── package.json
├── ms-wallet-consumer/    # Kafka consumer service
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── handlers/      # Event handlers
│   │   └── services/      # Database and Kafka services
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml     # Complete stack orchestration
```

## Quick Start

1. Clone the repository:
```bash
git clone <your-fork-url>
cd ilia-nodejs-challenge
```

2. (Optional) Configure environment variables:
```bash
# Copy example files
cp .env.example .env
cp ms-users/.env.example ms-users/.env
cp ms-wallet/.env.example ms-wallet/.env
cp ms-wallet-consumer/.env.example ms-wallet-consumer/.env

# Edit .env files to customize JWT secrets (recommended for production)
```

**Note:** If you skip this step, the services will use default values suitable for development.

3. Start the complete stack:
```bash
docker-compose up --build
```

This command will start:
- PostgreSQL for MS Users (port 5432)
- PostgreSQL for MS Wallet (port 5433)
- Kafka (port 9092)
- MS Users (port 3002)
- MS Wallet (port 3001)
- MS Wallet Consumer (background service)

4. Wait for all services to be healthy. You can check the status with:
```bash
docker-compose ps
```

5. The APIs are now available:
   - MS Users: http://localhost:3002
   - MS Wallet: http://localhost:3001

## API Documentation

### MS Users (Port 3002)

#### Authentication

**POST /auth**
```bash
curl -X POST http://localhost:3002/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  },
  "accessToken": "jwt-token"
}
```

#### User Management

**POST /users** (No authentication required)
```bash
curl -X POST http://localhost:3002/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "password": "password123"
  }'
```

**GET /users** (Requires authentication)
```bash
curl http://localhost:3002/users \
  -H "Authorization: Bearer <jwt-token>"
```

**GET /users/:id** (Requires authentication)
```bash
curl http://localhost:3002/users/<user-id> \
  -H "Authorization: Bearer <jwt-token>"
```

**PATCH /users/:id** (Requires authentication - Users can only update their own profile)
```bash
curl -X PATCH http://localhost:3002/users/<user-id> \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

**DELETE /users/:id** (Requires authentication - Users can only delete their own account)
```bash
curl -X DELETE http://localhost:3002/users/<user-id> \
  -H "Authorization: Bearer <jwt-token>"
```

### MS Wallet (Port 3001)

All endpoints require JWT authentication.

**POST /transactions**
```bash
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "amount": 1000,
    "type": "CREDIT"
  }'
```

**GET /transactions** (Returns only authenticated user's transactions)
```bash
# Get all user's transactions
curl http://localhost:3001/transactions \
  -H "Authorization: Bearer <jwt-token>"

# Filter by type (CREDIT or DEBIT)
curl http://localhost:3001/transactions?type=CREDIT \
  -H "Authorization: Bearer <jwt-token>"
```

**GET /transactions/:id**
```bash
curl http://localhost:3001/transactions/<transaction-id> \
  -H "Authorization: Bearer <jwt-token>"
```

**GET /balance** (Returns consolidated balance for authenticated user)
```bash
curl http://localhost:3001/balance \
  -H "Authorization: Bearer <jwt-token>"
```

Response:
```json
{
  "amount": 12050
}
```

## Environment Variables

### MS Users

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 3002 |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_USER | Database user | postgres |
| DATABASE_PASSWORD | Database password | postgres |
| DATABASE_NAME | Database name | users_db |
| JWT_SECRET | JWT secret for external API | ILIACHALLENGE |
| JWT_SECRET_INTERNAL | JWT secret for internal communication | ILIACHALLENGE_INTERNAL |
| KAFKA_BROKERS | Kafka broker addresses | localhost:9092 |

### MS Wallet

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Service port | 3001 |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5433 |
| DATABASE_USER | Database user | postgres |
| DATABASE_PASSWORD | Database password | postgres |
| DATABASE_NAME | Database name | wallet_db |
| JWT_SECRET | JWT secret for external API | ILIACHALLENGE |
| JWT_SECRET_INTERNAL | JWT secret for internal communication | ILIACHALLENGE_INTERNAL |
| KAFKA_BROKERS | Kafka broker addresses | localhost:9092 |

### MS Wallet Consumer

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5433 |
| DATABASE_USER | Database user | postgres |
| DATABASE_PASSWORD | Database password | postgres |
| DATABASE_NAME | Database name | wallet_db |
| KAFKA_BROKERS | Kafka broker addresses | localhost:9092 |
| KAFKA_GROUP_ID | Consumer group ID | wallet-consumer-group |
| KAFKA_CLIENT_ID | Consumer client ID | ms-wallet-consumer |

## Database Migrations

Both services use TypeORM migrations for database schema management.

### Generate a new migration

```bash
cd ms-users
npm run migration:generate src/infrastructure/database/migrations/MigrationName
```

### Run migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## Testing the Integration

1. Create a user:
```bash
curl -X POST http://localhost:3002/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

2. Authenticate:
```bash
curl -X POST http://localhost:3002/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. Use the returned token and user ID to create a transaction:
```bash
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer <token-from-step-2>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "<user-id-from-step-1>",
    "amount": 5000,
    "type": "CREDIT"
  }'
```

4. Check the MS Wallet Consumer logs to see the Kafka event being consumed:
```bash
docker logs ms-wallet-consumer
```

You should see messages indicating the user was cached successfully.

## Development Commands

### Build

```bash
npm run build
```

### Start in development mode

```bash
npm run start:dev
```

### Start in production mode

```bash
npm run start
```

## Design Decisions

### Separate Databases

Each microservice has its own database to ensure:
- Data isolation and independence
- Independent scaling
- Technology flexibility
- Failure isolation

### Kafka for Async Communication

Kafka was chosen for service communication because:
- Decouples services effectively
- Provides reliable message delivery
- Supports event-driven architecture
- Easy to scale and monitor

### Separate Consumer Service

The Wallet Consumer is separated from the Wallet API to:
- Follow microservices best practices
- Allow independent scaling of consumer and API
- Isolate consumer failures from API availability
- Simplify deployment and monitoring
- Enable different resource allocation strategies

### Clean Architecture

The implementation follows Clean Architecture to:
- Separate business logic from infrastructure
- Make the code testable and maintainable
- Allow easy replacement of external dependencies
- Enforce clear boundaries between layers

### TypeORM Migrations

Using migrations instead of synchronize ensures:
- Version control for database schema
- Safe production deployments
- Rollback capabilities
- Team collaboration on schema changes

## Troubleshooting

### Services not starting

Check if all required ports are available:
- 3001 (MS Wallet)
- 3002 (MS Users)
- 5432 (PostgreSQL Users)
- 5433 (PostgreSQL Wallet)
- 9092 (Kafka)

### Database connection errors

Ensure PostgreSQL containers are healthy:
```bash
docker-compose ps
```

### Kafka connection errors

Wait for Kafka to be fully initialized. The healthcheck ensures it is ready before starting the microservices.

### Migration errors

Migrations run automatically when containers start via docker-entrypoint.sh. If you need to run them manually:
```bash
docker-compose exec ms-users npm run migration:run
docker-compose exec ms-wallet npm run migration:run
```

### Consumer not processing events

Check consumer logs for errors:
```bash
docker logs ms-wallet-consumer
```

Ensure Kafka is healthy and the consumer is connected to the correct topic. Failed messages are sent to the Dead Letter Queue topic `user-events-dlq` after 3 retry attempts.

## License

This project is part of the ília Digital code challenge.
