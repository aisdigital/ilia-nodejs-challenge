# Improvements Backlog

This repo is already in a good place (clear architecture docs, Swagger UI per-service, integration tests, outbox + consumer retry ladder). The items below are targeted improvements I noticed while reviewing the codebase.

## P0 (should do next)

### 1) Fix migrations to work outside Docker

**Why:** `services/users/src/migrate.sh` and `services/wallet/src/migrate.sh` reference `/app/...`, so `bun --filter ... run migrate` won’t work when running locally (non-Docker).

**Planned steps**
1. Update both scripts to reference migration SQL via a path relative to the script location (no hard-coded `/app`).
2. Ensure both scripts still work in Docker (same container paths) and locally (developer machine).
3. Update `README.md` and service READMEs to clarify the two supported migration flows (Docker vs local).

### 2) Make the Users outbox publisher safer under failure

**Why:** `services/users/src/worker.ts` currently:
- Calls `waitForConfirms()` once per message (slow under load / can hammer RabbitMQ at high throughput).
- On any publish failure, increments `attempts` / sets `last_error` for *all* `pending` outbox rows (not just those picked up in the failed batch).
- Uses `setInterval` without awaiting, so publish cycles can overlap when a batch takes longer than the interval.

**Planned steps**
1. Change the loop to publish all messages in the batch then call `waitForConfirms()` once per batch.
2. Track the selected outbox row IDs and, on failure, only update `attempts` / `last_error` for those IDs.
3. Replace `setInterval` with an async loop (publish → sleep) to prevent overlapping runs; add exponential backoff (with a cap) on repeated failures.
4. Add env tunables like `OUTBOX_POLL_INTERVAL_MS` (already present) and `OUTBOX_BATCH_LIMIT`, and document reasonable defaults.
5. Add unit tests for “unknown event type → status=failed + last_error” and “attempts updated only for selected rows”.

### 3) Remove tracked `.env` (or explicitly justify keeping it)

**Why:** `.env` is present in the repo root even though it is ignored in `.gitignore`. If it’s tracked, it can drift from `.env.example` and encourage committing env secrets later.

**Planned steps**
1. Confirm whether `.env` is tracked in git history.
2. If tracked: remove it from git and keep `.env.example` as the template.
3. Add a short note in `README.md` about copying `.env.example` to `.env`.

## P1 (good improvements / maturity)

### 4) Align Bun versions across README, CI, and Docker

**Why:** `README.md` says Bun `1.3.x`, but CI (`.github/workflows/ci.yml`) and Dockerfiles use Bun `1.1.38`.

**Planned steps**
1. Decide the supported Bun version (pin to a specific minor for reproducibility).
2. Update `README.md`, `.github/workflows/ci.yml`, and both service Dockerfiles to match.
3. (Optional) Add a small “tooling versions” section to `README.md` to keep this consistent.

### 5) Speed up Docker builds with a root `.dockerignore`

**Why:** Docker build contexts use `context: .` and there’s no `.dockerignore`, so local `node_modules/` (and other artifacts) can balloon build time and image layer churn.

**Planned steps**
1. Add a root `.dockerignore` excluding `node_modules/`, `.git/`, `coverage/`, logs, etc.
2. Keep required inputs included (e.g. `bun.lock`, `package.json`, `services/**`).
3. Verify `docker compose build` still works.

### 6) Improve transaction pagination correctness

**Why:** `/v1/transactions` paginates by `created_at` only. If multiple rows share the same timestamp, pagination can skip/duplicate items.

**Planned steps**
1. Switch cursor to a stable tuple (e.g. `created_at + id`) and order by `(created_at, id)`.
2. Update query to filter by the tuple cursor.
3. Update OpenAPI docs and add/adjust a test covering cursor stability.

### 7) Add DB indexes for the hot paths

**Why:** Listing uses `WHERE user_id = $1 ORDER BY created_at DESC LIMIT ...`. Current index is `transactions(user_id)` only.

**Planned steps**
1. Add an index like `transactions(user_id, created_at DESC)` (and optionally include `id`).
2. Confirm queries use the index (optional: explain/analyze in dev).
3. Document the index rationale in a short migration comment or ADR note.

### 8) Clarify Idempotency-Key requirement in OpenAPI and docs

**Why:** The API behavior requires an `Idempotency-Key` header for credit/debit. The in-app Swagger likely shows it (via `schema.headers`), but the static OpenAPI file in `docs/api/ms-transactions.yaml` doesn’t.

**Planned steps**
1. Update `docs/api/ms-transactions.yaml` to require the header for credit/debit requests.
2. Add a note to `README.md` explaining why idempotency is required and how retries behave.

### 9) Add restart policies (and optionally healthchecks) in `docker-compose.yml`

**Why:** Workers can exit if dependencies aren’t ready yet (DB/broker startup). Without `restart: on-failure`/`unless-stopped`, they can remain down.

**Planned steps**
1. Add `restart: on-failure` (or `unless-stopped`) to `users-worker` and `wallet-worker` (and optionally to HTTP services).
2. (Optional) Add healthchecks for Postgres/RabbitMQ and change `depends_on` to `service_healthy` where supported.
3. Verify one-command `docker compose up ...` remains stable on cold start.

### 10) Make consumer retry controls configurable + improve failure logging

**Why:** Wallet provisioning retries are currently hard-coded to 3 tiers/attempts via `nextRetryQueue()`, which makes tuning harder without code changes. Also, more explicit logs on retries/DLQ improve debuggability.

**Planned steps**
1. Make retry tiers configurable (e.g. `RETRY_TTLS_MS=10000,30000,120000` or `MAX_RETRIES` + `RETRY_TTL_*`) and validate on startup.
2. Ensure retry requeue preserves headers and message persistence (already done) and keep DLQ bindings explicit in topology.
3. Log attempt number, chosen retry queue, and include the error when retrying; log a clear reason when routing to DLQ.
4. Add a unit test that `nextRetryQueue()` behavior matches configured tiers (or tier list parsing).

### 11) Improve rate-limit behavior (headers + docs)

**Why:** Rate limiting is enabled via env toggles, but clients benefit from standard rate-limit response headers and clear retry guidance.

**Planned steps**
1. Configure `@fastify/rate-limit` to emit standard headers (limit/remaining/reset) and ensure 429 responses include `Retry-After` when applicable.
2. Ensure rate-limit error bodies match the service-wide `ErrorResponse` shape (`{ code, message }`) for consistency.
3. Document defaults + env overrides in `README.md`, `services/users/README.md`, and `services/wallet/README.md`.

## P2 (optional / nice-to-have)

### 12) Reduce duplication between services (shared “common” module)

**Why:** Users and Wallet duplicate several chunks (health TCP check, Swagger setup, error handler patterns, config parsing).

**Planned steps**
1. Decide whether to keep duplication (explicitness) or extract shared utilities.
2. If extracting: add a `packages/common` workspace and move shared code behind stable APIs.
3. Update both services to import shared helpers; keep service-specific behavior local.

### 13) Make wallet readiness Retry-After configurable

**Why:** Wallet readiness gating uses a fixed `Retry-After: 2`, which is fine for the challenge but may not reflect real startup/provisioning times.

**Planned steps**
1. Add `WALLET_READY_RETRY_SECONDS` (default `2`) and use it for both the `Retry-After` header and the response body message if needed.
2. Ensure *all* gated code paths use the same helper (to keep headers/body consistent).
3. Keep “missing JWT” fast-fail behavior (401) and ensure error bodies remain consistent across endpoints.
4. Update OpenAPI (where appropriate) and tests to allow overriding the retry interval via env.

### 14) Tighten config validation and startup behavior

**Why:** Config parsing currently falls back to defaults (including `JWT_PRIVATE_KEY`). That’s correct for the challenge constraints, but risky if deployed beyond the challenge.

**Planned steps**
1. Add env validation (minimal: check required vars for the current process role).
2. Keep “challenge defaults” behind an explicit opt-in flag (e.g. `ALLOW_INSECURE_DEFAULTS=true`) or only for tests.
3. Fail fast with a clear error message when required env vars are missing.

### 15) Minimal metrics / observability (optional)

**Why:** The repo already has good structured request logs; a few counters for async flows make it easier to detect “stuck outbox” / “retry storms” / “DLQ growing”.

**Planned steps**
1. Add structured log fields for key counters (published count, publish failures, retry count, DLQ count) and keep them stable for parsing.
2. (Optional) Expose Prometheus-style metrics on `/metrics` (per process) if you want a concrete scrape target.
3. Document what to monitor and how to interpret DLQ/retry ladder behavior.

### 16) Docker hardening

**Planned steps**
1. Run containers as a non-root user where possible.
2. Add `HEALTHCHECK` to service images (if you prefer image-level health over compose-level).
3. Consider multi-stage builds to slim the runtime image (optional for this challenge).
