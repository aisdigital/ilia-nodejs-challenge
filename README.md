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
3) Apply migrations (SQL):
```
docker exec -i $(docker ps -qf "name=users-db") psql -U postgres -d users < services/users/migrations/001_create_users.sql
docker exec -i $(docker ps -qf "name=users-db") psql -U postgres -d users < services/users/migrations/002_create_outbox.sql
docker exec -i $(docker ps -qf "name=wallet-db") psql -U postgres -d wallet < services/wallet/migrations/001_create_wallets.sql
```
4) Start apps + workers:
```
bun install
bun run dev:users
bun run dev:wallet
bun --filter @app/users run worker:publisher
bun --filter @app/wallet run worker:consumer
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
psql $USERS_DATABASE_URL -f services/users/migrations/001_create_users.sql
psql $USERS_DATABASE_URL -f services/users/migrations/002_create_outbox.sql
psql $WALLET_DATABASE_URL -f services/wallet/migrations/001_create_wallets.sql
```
3) Start apps + workers (same as Docker step 4).
