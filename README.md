# Project/Challenge

## Docs

- Architecture: `docs/architecture/README.md`
- API specs: `docs/api/ms-users.yaml`, `docs/api/ms-transactions.yaml`

## Requirements

- Bun `1.3.x`
- Docker + Docker Compose (for local infra)

## Quickstart (Docker)

1) Create env:
```
cp .env.example .env
```
2) Start infrastructure:
```
docker compose up -d rabbitmq users-db wallet-db
```
3) Apply migrations:
```
bun run migrate
```
4) Start apps + workers:
```
bun install
bun run dev:users
bun run dev:wallet
bun --filter @app/users run worker:publisher
bun --filter @app/wallet run worker:consumer
```

Or start everything via compose (services + workers):
```
docker compose up --build
```

## Local (no Docker)

1) Start Postgres and RabbitMQ locally, then set:
```
USERS_DATABASE_URL=postgres://...
WALLET_DATABASE_URL=postgres://...
RABBITMQ_URL=amqp://...
JWT_PRIVATE_KEY=ILIACHALLENGE
```
2) Apply migrations:
```
bun run migrate
```
3) Start apps + workers (same as Docker step 4).
