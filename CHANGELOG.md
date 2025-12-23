# Changelog

All notable changes to this project will be documented in this file.

## Unreleased
### Documentation
- Added ADR D010 for rate limiting.
- Aligned executive plan decisions to ADR-lite record (D001–D010).

### Infrastructure
- Added `docker-compose.yml` for RabbitMQ + per-service Postgres.

### Build/CI
- Added GitHub Actions workflow running lint/typecheck/test.
- Bootstrapped Bun workspaces and shared TypeScript config.

### Scaffolding
- Added initial Users/Wallet service skeletons.
- Moved OpenAPI specs to `docs/api/`.

### Features
- Users service: register/login/me endpoints with JWT auth.
- Added users DB plugin, schema migration, and rate limiting for auth routes.
- Wallet service: readiness gating middleware returning `503` + `Retry-After`.
- Added wallet DB plugin and base wallet/transactions schema.
- Wallet consumer worker with RabbitMQ topology and retry ladder for provisioning.
- Users outbox publisher worker for reliable event emission.
- Added initial unit tests for wallet rules and messaging helpers.
- Implemented wallet transaction endpoints with balance computation and debit checks.
- Added auth hardening for JWT `sub` presence and redacted auth headers in logs.
- Added run instructions and service README summaries.
- Added migration scripts and compose worker services.
- Compose can now run migrations and workers automatically; added Docker one-command run.
- README quickstart links to the one-command Docker section.
- Served OpenAPI/Swagger UI for Users and Wallet; documented API docs and Hoppscotch import.
- TODO noted for a consolidated Swagger UI container.
