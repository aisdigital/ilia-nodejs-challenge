# ília - Code Challenge NodeJS
**English**
##### Before we start ⚠️
**Please create a fork from this repository**

## The Challenge:
One of the ília Digital verticals is Financial and to level your knowledge we will do a Basic Financial Application and for that we divided this Challenge in 2 Parts.

The first part is mandatory, which is to create a Wallet microservice to store the users' transactions, the second part is optional (*for Seniors, it's mandatory*) which is to create a Users Microservice with integration between the two microservices (Wallet and Users), using internal communications between them, that can be done in any of the following strategies: gRPC, REST, Kafka or via Messaging Queues and this communication must have a different security of the external application (JWT, SSL, ...), **Development in javascript (Node) is required.**

![diagram](diagram.png)

### General Instructions:
## Part 1 - Wallet Microservice

This microservice must be a digital Wallet where the user transactions will be stored

### The Application must have

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.
    - Have a dedicated database (Postgres, MySQL, Mongo, DynamoDB, ...).
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Configure the Microservice port to 3001.
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a team work and not just a commit.

## Part 2 - Microservice Users and Wallet Integration

### The Application must have:

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.
    - Have a dedicated database(Postgres, MySQL, Mongo, DynamoDB...), you may use an Auth service like AWS Cognito.
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Set the Microservice port to 3002.
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a teamwork and not just a commit.
    - Internal Communication Security (JWT, SSL, ...), if it is JWT the PrivateKey must be ILIACHALLENGE_INTERNAL (passed by env var).
    - Communication between Microservices using any of the following: gRPC, REST, Kafka or via Messaging Queues (update your readme with the instructions to run if using a Docker/Container environment).

## How to run the application (step by step)

This guide contains clear steps to bring up the infrastructure and services locally, as well as useful commands for development, testing, and production.

> Note: there is a `.env.example` file in the repository with necessary variables. Run `cp .env.example .env` and adjust according to your environment.

### Prerequisites

- Node.js 20.19.0 (exact, as per `package.json` engines)
- Docker and Docker Compose (`docker compose`)
- npm (to install dependencies)

### 1) Install dependencies

In the monorepo root:

```bash
npm ci
```

This will install dependencies for the entire monorepo.

### 2) Prepare environment

```bash
cp .env.example .env
```

Important variables:

- `JWT_PRIVATE_KEY` — external token (recommended `ILIACHALLENGE`)
- `JWT_INTERNAL_PRIVATE_KEY` — token between services (recommended `ILIACHALLENGE_INTERNAL`)
- `PORT` (each service can have its own var): Wallet `3001`, Users `3002`
- `GRPC_URL` / `GRPC_PORT` — URLs/ports for gRPC if applicable

### 3) Bring up infrastructure with Docker Compose (local)

```bash
docker compose up -d --build
```

- The compose includes Postgres for `users` and `wallet`, Kafka/Zookeeper/Kafka-UI, and the `users-service` (port 3002) and `wallet-service` (port 3001/50053) services.
- If you need to check if the wallet Postgres is up: `pg_isready -h localhost -p 5433 -U postgres`.
- Services run with Node.js 20.19.0 in Alpine containers.

### 4) Run in dev mode (hot reload)

In separate terminals:

```bash
# Users
npm run start:dev:users

# Wallet
npm run start:dev:wallet
```

### 5) Run tests locally

Unit tests (wallet):

```bash
npm run test:wallet:unit
```

Unit tests (users):

```bash
npm run test:users:unit
```

Tests with coverage (wallet):

```bash
npm run test:wallet:cov
```

CI will run lint, build (production) and tests with coverage; the job will fail if thresholds are not met.

### 6) Build for production

```bash
npm run build:wallet
npm run build:users
```

Output will be in `dist/apps/<service>`.

### 7) Run in production

```bash
# after build
node dist/apps/wallet-service/src/main.js
node dist/apps/users-service/src/main.js
```

or with Docker (build images manually according to README-COMPLETO).

### 8) Swagger (OpenAPI)

- If `@nestjs/swagger` is installed, access `http://localhost:3001/api` (wallet) and `http://localhost:3002/api` (users).
- Implementation in `main.ts` uses dynamic import and won't break if the package is not present.

### 9) Notes and troubleshooting

- If you notice port in use errors: `lsof -i :3001` / `kill -9 <PID>`.
- If CI fails due to DB not ready, check `docker compose logs` and `pg_isready`

---

If you want, I can generate optional scripts for: running migrations automatically, initial seeds, and a more robust `wait-for-db` script (for example using `wait-for-it` or a small Node script that tries to connect to the DB).

#### In the end, send us your fork repo updated. As soon as you finish, please let us know.

#### We are available to answer any questions.


Happy coding! 🤓
