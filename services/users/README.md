## Users Service

### Endpoints

- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/users/me`

### Worker

- `bun --filter @app/users run worker:publisher`

### Migrations

- Run: `bun --filter @app/users run migrate`
- `services/users/migrations/001_create_users.sql`
- `services/users/migrations/002_create_outbox.sql`
