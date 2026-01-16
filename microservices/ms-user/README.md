# User Microservice

Part 2 of the ília Digital Challenge - User management and authentication service.

## Features

- User registration and authentication
- JWT token generation
- Internal communication with Wallet microservice
- PostgreSQL database
- Docker support

## Tech Stack

- Node.js + TypeScript
- Fastify
- Sequelize (PostgreSQL)
- JWT Authentication
- Docker

## Setup

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3002
DB_HOST=localhost
DB_PORT=5433
DB_USER=user_user
DB_PASSWORD=user_pass
DB_NAME=user_db
JWT_SECRET=secret
JWT_INTERNAL_SECRET=secret
```

### Run with Docker

From the root directory:

```bash
docker-compose up user-postgres user-app
```

### Run Locally

```bash
npm install
npm run dev
```

## API Endpoints

- `POST /register` - Register new user
- `POST /login` - Authenticate user
- `GET /me` - Get current user info (requires JWT)
- `GET /health` - Health check

## Architecture

```
src/
├── application/         # Use cases (business logic)
├── domain/             # Entities and repository interfaces
├── infrastructure/     # External implementations
│   ├── api/           # HTTP (controllers, routes, middleware)
│   ├── database/      # Database models and repositories
│   └── grpc/          # gRPC client for wallet service
└── server.ts          # Application entry point
```
