# Wallet Service

Microservice for managing user wallets and financial transactions with JWT authentication.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=ILIACHALLENGE
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
PRIVATE_KEY=ILIACHALLENGE
PRIVATE_KEY_INTERNAL=ILIACHALLENGE_INTERNAL
```

### Installation

```bash
npm install
```

### Run Migrations

Migrations are executed automatically when starting the service.

### Run Locally

```bash
npm start
```

The service will be available at `http://localhost:3001`

## Docker

### Build Image

```bash
docker build -t wallet-service .
```

### Run with Docker Compose

```bash
docker-compose up wallet-service
```

### Internal Endpoints

#### POST /internal/transactions
Internal endpoint for service-to-service communication. Requires internal JWT token.

**Request:**
```json
{
  "userId": "uuid",
  "type": "CREDIT",
  "amount": 100,
  "description": "Optional description"
}
```

#### GET /internal/transactions?userId=xxx&type=CREDIT|DEBIT
Internal endpoint to list transactions. Requires internal JWT token.

#### GET /internal/balance?userId=xxx
Internal endpoint to get balance. Requires internal JWT token.

## Features

- **SQL Transactions**: All transaction operations use SQL transactions to ensure atomicity and prevent double credit/debit
- **Dynamic Balance Calculation**: Balance is calculated dynamically from transactions using SQL queries (as per requirements)
- **Lock Mechanism**: Uses SELECT FOR UPDATE to prevent race conditions
- **Balance Validation**: Validates sufficient balance before processing debit transactions

## Security

- All routes require JWT authentication
- Internal communication uses a different JWT key (`JWT_SECRET_INTERNAL`)
- Input validation on all endpoints

## Project Structure

```
wallet-service/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Middlewares (auth, validators)
│   ├── migrations/       # Database migrations
│   ├── models/           # Sequelize models
│   ├── routes/           # Route definitions
│   │   ├── index.js      # Public API routes
│   │   └── internal.js   # Internal service routes
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── Dockerfile
├── package.json
└── README.md
```

