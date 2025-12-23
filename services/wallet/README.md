## Wallet Service

### Endpoints

- `GET /v1/balance`
- `GET /v1/transactions`
- `POST /v1/transactions/credit`
- `POST /v1/transactions/debit`

### Worker

- `bun --filter @app/wallet run worker:consumer`

### Migrations

- Run: `bun --filter @app/wallet run migrate`
- `services/wallet/migrations/001_create_wallets.sql`
