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

See also: [One-command Docker run](#one-command-docker-all-services--workers--migrations).

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

## One-command Docker (all services + workers + migrations)

This starts DBs, RabbitMQ, runs migrations, and brings up services + workers:
```
docker compose up --build users-migrate wallet-migrate users wallet users-worker wallet-worker rabbitmq users-db wallet-db
```

## API docs

- Users OpenAPI/Swagger UI: `http://localhost:3002/docs` (spec at `/openapi.json`)
- Wallet OpenAPI/Swagger UI: `http://localhost:3001/docs` (spec at `/openapi.json`)
- Hoppscotch: import the OpenAPI URL for each service (e.g., `http://localhost:3002/openapi.json`)
- Consolidated Swagger UI (requires `docker-compose.override.yml`): `http://localhost:8080` (preloaded with Users + Wallet specs)

## Releases

- Commit style: Conventional Commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`)
- Generate changelog + tag: `bun run release` (uses `standard-version`)
