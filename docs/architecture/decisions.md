# Architecture Decisions (ADR-lite)


This file captures the key technical decisions for the Users (3002) + Wallet (3001) challenge.

---

## D001 — Async provisioning via RabbitMQ

**Status:** Accepted

**Context:** Wallet must be created per user, and services should communicate via a messaging queue.

**Options considered:**
- Users → Wallet synchronous REST call during registration
- Users emits `UserRegistered` event via RabbitMQ (async)

**Choice:** Use RabbitMQ event-driven provisioning (`user.registered`).

**Rationale:** Decouples services, tolerates wallet downtime, aligns with queue requirement, and demonstrates resilience patterns.

**Consequences / follow-ups:**
- Eventual consistency: wallet may not exist immediately after register.
- Document client behavior; Wallet returns 503 + `Retry-After` while provisioning.

---

## D002 — Outbox pattern for reliable event publishing

**Status:** Accepted

**Context:** Avoid “user created but event lost” if broker is down after DB commit.

**Options considered:**
- Best-effort publish after inserting user
- Transactional outbox + publisher worker

**Choice:** Use an outbox table and a publisher worker; mark outbox rows as published only after broker confirms.

**Rationale:** Provides reliable emission with minimal complexity and is a common microservice pattern.

**Consequences / follow-ups:**
- Extra table + worker process.
- Monitor outbox backlog via logs.

---

## D003 — Wallet readiness gating on ALL wallet endpoints

**Status:** Accepted

**Context:** Immediately after registration the wallet may not be provisioned yet.

**Options considered:**
- Lazy-create wallet on first wallet request
- Return `409 Conflict`
- Return `503 Service Unavailable` with `Retry-After` (fixed)

**Choice:** Return `503` with `Retry-After: 2` until the wallet exists.

**Rationale:** Provisioning is temporary; 503 communicates “try again later” and supports standard retry semantics.

**Consequences / follow-ups:**
- Clients must retry; documented in README.
- Keep `Retry-After` fixed for challenge simplicity.

---

## D004 — Idempotent wallet creation (one wallet per user)

**Status:** Accepted

**Context:** Events are at-least-once; duplicates can occur.

**Options considered:**
- Track processed message IDs
- Enforce uniqueness at DB level and use upsert

**Choice:** `wallets.userId` is `UNIQUE` and provisioning uses `INSERT ... ON CONFLICT DO NOTHING`.

**Rationale:** Simple, robust idempotency for the core invariant.

**Consequences / follow-ups:**
- Still need payload validation; poison events go to DLQ.

---

## D005 — Retry ladder + DLQ for consumer failures

**Status:** Accepted

**Context:** Consumer may fail transiently (DB down) or permanently (invalid payload).

**Options considered:**
- Immediate requeue
- Fixed delay
- TTL retry queues (10s → 30s → 120s) + DLQ

**Choice:** TTL retry ladder + DLQ.

**Rationale:** Avoids retry storms, provides controlled backoff, and gives a place (DLQ) to inspect poison messages.

**Consequences / follow-ups:**
- More RabbitMQ resources; keep tiers limited (3).
- Document how to inspect DLQ in README.

---

## D006 — Balance stored as ledger of transactions (computed on read)

**Status:** Accepted (challenge scope)

**Context:** Need credits/debits and balance correctness; concurrency requirements are explicitly relaxed.

**Options considered:**
- Store balance column and update transactionally
- Compute balance from transactions

**Choice:** Compute balance from transactions; amounts stored in `amountMinor` integers.

**Rationale:** Simple correctness model and easy to reason about; avoids rounding issues.

**Consequences / follow-ups:**
- Potential performance limits at scale; acceptable for challenge.
- Concurrency edge cases not fully addressed; document future approach (DB tx + locking).

---

## D007 — AuthN/AuthZ model (JWT + self-only)

**Status:** Accepted

**Context:** All routes must require JWT; “admin role” not required.

**Options considered:**
- JWT auth only (no authorization checks)
- JWT + authorize by `sub` (self-only)
- RBAC/admin role

**Choice:** Self-only access: `sub` is the userId for all wallet actions.

**Rationale:** Prevents horizontal escalation with minimal complexity.

**Consequences / follow-ups:**
- No privileged admin operations; seed “admin” user is only for demo.

---

## D008 — Minimal observability baseline

**Status:** Accepted

**Context:** Not explicitly required, but improves evaluation and debugging.

**Options considered:**
- Console logs only
- Structured logs + requestId + health endpoints

**Choice:** Structured JSON logs (pino), `x-request-id`, `/health/live`, `/health/ready`.

**Rationale:** High signal-to-effort; helps diagnose async flows.

**Consequences / follow-ups:**
- Metrics/tracing optional; not implemented for challenge.

---

## D009 — Changelog automation without vendor lock-in

**Status:** Accepted

**Context:** Want automated changelog/versioning without GitHub-specific tooling.

**Options considered:**
- release-please
- standard-version

**Choice:** `standard-version`.

**Rationale:** CI-provider-agnostic and works locally; aligns with “no vendor lock-in”.

**Consequences / follow-ups:**
- Requires Conventional Commits discipline; document commit format in README.

---

## D010 — Rate limiting for auth and transaction endpoints

**Status:** Accepted

**Context:** Public auth endpoints (register/login) and transaction endpoints are common abuse vectors; the challenge doesn’t require rate limiting but it improves baseline security and resilience.

**Options considered:**
- No rate limiting
- Add rate limiting in-app (Fastify plugin)
- Rely on an API gateway / reverse proxy only

**Choice:** Use `@fastify/rate-limit` with per-route limits and an env toggle.

**Rationale:** Fast to implement and easy to document; keeps the solution self-contained while still allowing production deployments to move rate limiting to a shared store or gateway.

**Consequences / follow-ups:**
- In-memory limits won’t be shared across instances; document Redis/gateway approach for production.
- Allow disabling or relaxing limits in tests/dev via env.

---

## D011 — Optional admin role & consolidated API docs portal

**Status:** Proposed

**Context:** Current API is self-only. An admin capability and a single docs entry point were requested.

**Options considered:**
- Keep self-only; per-service Swagger only.
- Add admin role (JWT claim) + admin-only endpoints; add a unified docs portal.

**Choice (if adopted):** Introduce an `admin` role and admin-only endpoints (list/get users; optional wallet inspection), and expose a consolidated Swagger UI that lists both services’ OpenAPI documents.

**Rationale:** Enables support/operations use cases and simplifies discovery via a single docs portal.

**Consequences / follow-ups:**
- Requires role column and authZ middleware; more tests and seeds.
- Consolidated docs container added (Swagger UI pointing to both OpenAPI URLs).
