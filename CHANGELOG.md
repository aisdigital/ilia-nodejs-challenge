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
- Added guarded integration test (register → wallet provisioning) runnable with `RUN_INTEGRATION=true`.
- Integration tests cover both happy path and 401 without JWT.
- Added `standard-version` release tooling and Conventional Commits note.
- Added optional consolidated Swagger UI via `docker-compose.override.yml`.
- Added users HTTP tests for register/login validations.
- Added wallet HTTP integration tests (guarded) covering gating, credit/debit/list, and 401.
- Added outbox publisher helper tests for routing key and request-id propagation.
- Added consumer retry ladder and x-death handling tests.
- Added consumer DLQ integration test (guarded) for invalid payloads.
- Proposed admin role + consolidated docs ADR (D011); added Hoppscotch optional note.
- Migrates now run inside Docker network via compose-run migrate services.
- Added one-command `up` and `up:docs` scripts for full stack (with optional consolidated Swagger UI).
- Consolidated Swagger UI is now part of the default compose `up` flow.
- Removed obsolete override compose file (docs now default in main compose).
