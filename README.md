# Ilia Node.js Challenge

A microservices architecture project built with Node.js, TypeScript, Express, and PostgreSQL using Docker Compose for orchestration.

## Project Structure

This project consists of two independent microservices:

```
├── services/
│   ├── users/          # User management service (port 3002)
│   └── wallet/         # Wallet management service (port 3001)
├── docker-compose.yml  # Service orchestration
└── README.md           # This file
```

## Services

### Users Service
- **Port**: 3002
- **Database**: PostgreSQL (users-db on port 5434)
- **Technology**: Node.js, TypeScript, Express
- **Endpoints**:
  - `GET /` - Service status check
  - `GET /health` - Health check with uptime

### Wallet Service
- **Port**: 3001
- **Database**: PostgreSQL (wallet-db on port 5433)
- **Technology**: Node.js, TypeScript, Express
- **Endpoints**:
  - `GET /` - Service status check
  - `GET /health` - Health check with uptime

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development without Docker)
- npm

### Environment Setup

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update `.env` with your configuration if needed:

```env
WALLET_DB_URL=postgres://postgres:password@wallet-db:5432/wallet
WALLET_JWT_SECRET=ILIACHALLENGE
USERS_DB_URL=postgres://postgres:password@users-db:5432/users
USERS_JWT_SECRET=ILIACHALLENGE
USERS_JWT_INTERNAL_SECRET=ILIACHALLENGEINTERNAL
NODE_ENV=development
```

### Running with Docker Compose

```bash
docker-compose up
```

This will:
- Start both PostgreSQL databases
- Build and start the users service (http://localhost:3002)
- Build and start the wallet service (http://localhost:3001)

### Running Locally (Development)

For each service, navigate to the service directory and run:

```bash
cd services/users
npm install
npm run dev
```

```bash
cd services/wallet
npm install
npm run dev
```

## Available Scripts

Each service has the following npm scripts:

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript

## Configuration

Environment variables are configured via the `.env` file. Copy `.env.example` to `.env` and update the values as needed.

### Environment Variables

**Wallet Service**:
- `WALLET_DB_URL` - PostgreSQL connection string
- `WALLET_JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

**Users Service**:
- `USERS_DB_URL` - PostgreSQL connection string
- `USERS_JWT_SECRET` - JWT signing secret
- `USERS_JWT_INTERNAL_SECRET` - Internal JWT secret for service-to-service communication
- `NODE_ENV` - Environment (development/production)

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Development**: tsx (for TypeScript watching)
