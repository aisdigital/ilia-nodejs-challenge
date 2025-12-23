# Executive Plan

1. Executive Summary
* Deliver 2 Fastify microservices: Users (port 3002) and Wallet (port 3001), each with a dedicated Postgres DB, all Dockerized.
* Users supports registration + login (password-based) and emits `UserRegistered` events via RabbitMQ using an Outbox pattern.
* Wallet consumes `UserRegistered` to provision exactly one wallet per user; all wallet endpoints are gated until provisioned, returning `503` + fixed `Retry-After: 2`.
* JWT auth (HS256) on all private routes using env secret `JWT_PRIVATE_KEY=ILIACHALLENGE`; internal secret `INTERNAL_JWT_PRIVATE_KEY=ILIACHALLENGE_INTERNAL` available if needed.
* Add basic rate limiting, minimal observability, CI, and changelog automation via `standard-version` (no vendor lock-in).

2. Assumptions
* “Admin user” is a seeded normal user (no admin role / no special privileges).
* Single currency (USD). Amounts stored as integer minor units (`amountMinor`) for correctness, despite “simple number” preference.
* “Concurrency agnostic” means we won’t implement DB locking/idempotency for transactions; we accept that extreme concurrent debits could violate invariants (documented).
* Event delivery is at-least-once; consumer must be idempotent. Exactly-once messaging is out of scope.
* Observability is not required by the challenge, but a minimal baseline is included for maturity and debuggability.
* Retry backoff ladder is fixed at 10s → 30s → 120s for challenge; wallet readiness retry is fixed at 2s.

3. Requirements Mapping
* Wallet Microservice (mandatory)
  - HTTP API, dedicated DB, Dockerized.
  - Port 3001.
  - JWT auth on all routes; secret via env; value must be ILIACHALLENGE.
  - Stores user transactions and enforces non-negative balance on debit.
* Users Microservice (mandatory for this submission)
  - HTTP API, dedicated DB, Dockerized.
  - Port 3002.
  - JWT auth on all routes except register/login; secret ILIACHALLENGE.
  - Integration with Wallet through Messaging Queues; internal security key ILIACHALLENGE_INTERNAL available.
* Process requirements
  - Gitflow + at least one PR merged to main.
  - README setup instructions.

4. Architecture Overview
* High-level
  - users-svc (Fastify) + users-db (Postgres)
  - wallet-svc (Fastify) + wallet-db (Postgres)
  - rabbitmq (message broker) for async provisioning
* Communication
  - Users → RabbitMQ: publish `UserRegistered`
  - Wallet ← RabbitMQ: consume and provision wallet row
  - No synchronous Users→Wallet call required for provisioning (reduces coupling).
* Clean/Hexagonal layering (per service)
  - HTTP adapters (routes/controllers + middleware)
  - Application layer (use-cases)
  - Domain layer (entities/value objects + invariants)
  - Infra layer (DB repos, JWT, Rabbit clients)
* Standards alignment (pragmatic for challenge)
  - REST-ish JSON APIs, consistent error model.
  - Twelve-Factor config via env vars.
  - Secure defaults and least privilege in DB/users.

5. Key Decisions and Trade-offs
(Canonical ADR-lite record: [Decisions](./decisions.md))
* Decision (D001): Async wallet provisioning via RabbitMQ (Messaging Queue)
  - Options Considered: Users→Wallet REST; RabbitMQ; Kafka/Redpanda; no broker.
  - Decision: RabbitMQ.
  - Rationale: simplest queue semantics + built-in DLQ patterns; easy Docker; minimal coupling; fits allowed “Messaging Queues”.
  - Pros: decoupled services; resilient; easy to demo with management UI.
  - Cons: additional infra; configuration verbosity for retries/DLQ.
  - Trade-offs: operational simplicity vs extra container.
  - Mitigations: keep topology minimal; document in README.
  - Alternative wins when: need replay/audit log → Kafka; need minimal infra → accept synchronous REST.
* Decision (D002): Reliable publish with Outbox pattern + publisher confirms
  - Options: best-effort publish after user insert; outbox; outbox + confirms (selected).
  - Rationale: wallet provisioning is critical; outbox avoids “user created but event lost”.
  - Pros: strong reliability; standard pattern.
  - Cons: extra table + worker.
  - Mitigations: keep schema small; polling loop; clear logs/metrics.
  - Alternative wins when: ultra-minimal MVP and losing events acceptable (not recommended).
* Decision (D005): Retry with backoff ladder + DLQ (10s → 30s → 120s)
  - Options: immediate requeue; fixed delay; exponential backoff ladder (selected).
  - Rationale: avoids retry storms; handles transient failures (DB down) predictably.
  - Pros: scalable; doesn’t block consumers; standard RabbitMQ TTL+DLX pattern.
  - Cons: more queues.
  - Mitigations: only 3 tiers; env-configurable TTLs.
  - Alternative wins when: you accept occasional manual reruns → simpler fixed delay.
* Decision (D003): Wallet readiness gating with `503 Service Unavailable` + fixed `Retry-After: 2`
  - Options: 409 vs 503 vs lazy-create wallet on read.
  - Decision: 503.
  - Rationale: provisioning is temporary; 503+Retry-After gives clear retry semantics.
  - Pros: explicit eventual consistency; no hidden side effects on reads.
  - Cons: clients must retry; evaluator may hit too fast.
  - Mitigations: strong README guidance; optional `/v1/wallet/status`.
  - Alternative wins when: UX must be seamless → lazy-create with strict idempotency.
* Decision (D007): Authorization model = self-only via JWT `sub` (no admin role)
  - Options: no authZ; sub-matching; RBAC/admin (rejected).
  - Decision: sub-matching only.
  - Rationale: prevents horizontal privilege escalation while keeping scope minimal.
  - Pros: prevents horizontal privilege escalation with minimal code.
  - Cons: no “inspect other users” capabilities.
  - Mitigations: seeded “admin” user for demo only; no privilege.
  - Alternative wins when: backoffice required → add roles and RBAC later.
* Decision (D010): Rate limiting via Fastify plugin
  - Options: none; app-level plugin; gateway-only.
  - Decision: `@fastify/rate-limit`.
  - Rationale: quick to add; improves security posture; easy to document.
  - Pros: per-route control; immediate value.
  - Cons: in-memory limits don’t share across instances.
  - Mitigations: document Redis store for production; disable/relax in tests via env.
  - Alternative wins when: multi-instance scaling → shared store/gateway.
* Decision (D004): Idempotent wallet creation (one wallet per user)
  - Options: processed-message tracking; DB uniqueness + upsert (selected).
  - Decision: `wallets.userId` is `UNIQUE` and provisioning uses `INSERT ... ON CONFLICT DO NOTHING`.
  - Rationale: simplest robust idempotency for the invariant.
  - Consequences: validate payloads; route poison events to DLQ.
* Decision (D006): Balance stored as transaction ledger (computed on read)
  - Options: store a balance column; compute from transactions (selected).
  - Decision: compute balance by aggregating transactions; store amounts as integer minor units (`amountMinor`).
  - Rationale: easy to reason about and avoids rounding errors; acceptable performance for challenge scope.
  - Consequences: O(n) reads; production follow-up would add DB tx + locking and/or a cached balance.
* Decision (D008): Minimal observability baseline
  - Options: console logs only; structured logs + requestId + health endpoints (selected).
  - Decision: structured JSON logs (pino), `x-request-id`, `/health/live`, `/health/ready`.
  - Rationale: high signal-to-effort; improves debugging of async flows.
* Decision (D009): Changelog automation without vendor lock-in
  - Options: release-please; standard-version (selected).
  - Decision: `standard-version`.
  - Rationale: CI-provider-agnostic and works locally; aligns with “no vendor lock-in”.

6. Implementation Plan
* Repo structure (mono-repo recommended)
  - `services/users/` (Fastify app + publisher worker)
  - `services/wallet/` (Fastify app + consumer worker)
  - `docker-compose.yml`
  - `CHANGELOG.md`
* Users service (3002)
  - Public endpoints:
    - `POST /v1/auth/register` { name, email, password } → 201 { user, accessToken, expiresIn }
    - `POST /v1/auth/login` { email, password } → 200 { accessToken, expiresIn }
  - Private endpoints (JWT):
    - `GET /v1/users/me` → 200 user profile
  - Passwords: bcrypt hash + verify; minimum password length (e.g., 8).
  - DB tables:
    - `users(id, name, email UNIQUE, passwordHash, createdAt)`
    - `outbox(id, type, payloadJson, status, attempts, lastError, createdAt, publishedAt)`
  - Registration flow:
    - DB tx: insert user + insert outbox(UserRegistered{userId})
    - Return JWT immediately.
  - Publisher worker:
    - Poll pending outbox rows, publish persistent message to RabbitMQ with confirms, mark published.
  - Seed user:
    - Insert a normal seeded user using env: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (hash on seed).
* Wallet service (3001)
  - Provisioning consumer:
    - Consume `UserRegistered`; upsert wallet: `INSERT wallets(userId) ... ON CONFLICT DO NOTHING`; ACK.
  - DB tables:
    - `wallets(id, userId UNIQUE, createdAt)`
    - `transactions(id, userId, type, amountMinor, description, createdAt)`
  - All wallet endpoints require JWT; derive `userId` from JWT `sub`.
  - Readiness gating (ALL wallet endpoints):
    - Middleware checks `wallets` row exists for `sub`.
    - If missing: `503`, body `{ code: "WALLET_PROVISIONING", message: "Wallet is being provisioned. Retry shortly." }`, header `Retry-After: 2`.
  - Wallet endpoints:
    - `POST /v1/transactions/credit` { amountMinor, description? }
    - `POST /v1/transactions/debit` { amountMinor, description? } → reject if would go negative (compute current balance by aggregation)
    - `GET /v1/balance`
    - `GET /v1/transactions?limit&cursor`
    - (Optional) `GET /v1/wallet/status`
* RabbitMQ topology (durable)
  - Exchange: `domain.events` (topic)
  - Queue: `wallet.provision` bound `user.registered`
  - DLX: `domain.events.dlx`
  - DLQ: `wallet.provision.dlq`
  - Retry ladder queues (TTL + DLX back to main):
    - `wallet.provision.retry.10s` (10_000 ms)
    - `wallet.provision.retry.30s` (30_000 ms)
    - `wallet.provision.retry.120s` (120_000 ms)
  - Consumer retry logic:
    - For transient failures: route to next retry tier based on attempt count (`x-death`) then ACK original.
    - For invalid payload/permanent errors: reject to DLQ.
* Configuration (.env.example contains no JWT tokens)
  - Required:
    - `JWT_PRIVATE_KEY=ILIACHALLENGE`
    - `INTERNAL_JWT_PRIVATE_KEY=ILIACHALLENGE_INTERNAL`
    - `USERS_PORT=3002`, `WALLET_PORT=3001`
    - DB URLs for each service
    - `RABBITMQ_URL=...`
  - Rate limit toggles:
    - `RATE_LIMIT_ENABLED=true`
    - `RL_REGISTER_MAX=5`, `RL_LOGIN_MAX=10`, `RL_TX_MAX=30`, windows (e.g., `1m`)
  - Retry TTLs:
    - `RETRY_TTL_1_MS=10000`, `RETRY_TTL_2_MS=30000`, `RETRY_TTL_3_MS=120000`
* Changelog automation (no vendor lock-in)
  - Use `standard-version`.
  - Enforce Conventional Commits in team process (document in README).
  - Add scripts: `npm run release` → updates `CHANGELOG.md`, bumps version, creates git tag.

7. Security, Privacy, Compliance
* JWT
  - HS256, validate signature + exp; require `sub`.
  - No tokens in logs; do not echo secrets.
* Password handling
  - bcrypt, generic login error messages, rate limit login/register.
* Events
  - Payload minimal: `{ userId }` only.
  - Validate schema before processing; malformed → DLQ.
* Secrets
  - Env vars only; `.env.example` safe.

8. Testing and Quality
* Unit tests (≥80% on core logic)
  - Users: hashing/verify; register/login flows; JWT issuance.
  - Wallet: debit rule (non-negative); balance aggregation.
  - Messaging: event schema validation; retry tier selection logic.
* Integration tests (Docker services)
  - Register → outbox publish → wallet provisioned.
  - Immediate wallet call after register → 503 + Retry-After; later → 200.
  - Broker down: register works; outbox pending increases; broker returns; outbox drains; wallet created.
  - Poison message goes to DLQ.
* E2E smoke
  - Register → login → credit → debit → balance correct.

9. CI/CD and Developer Experience
* GitFlow evidence
  - Create feature branch, open at least one PR, merge to main.
* GitHub Actions (minimal)
  - install, lint, test, build
  - optional: docker build
  - optional: CodeQL for JS/TS
* Developer scripts
  - `npm run dev`, `npm run test`, `npm run lint`
  - `npm run worker:publisher` (Users)
  - `npm run worker:consumer` (Wallet)
* Documentation (README)
  - One-command startup via docker compose
  - How to register/login and call wallet
  - Explain 503 wallet provisioning and retry loop
  - Explain RabbitMQ queues, retry ladder, and DLQ inspection

10. Observability and Operations
* Minimal baseline (kept intentionally small)
  - Structured JSON logs (Fastify/pino).
  - Request ID: accept/generate `x-request-id`, return it, include in logs; propagate to messages.
  - Health endpoints:
    - `/health/live` (process up)
    - `/health/ready` (DB reachable; broker reachable for workers)
  - Log key async lifecycle:
    - Users publisher: publish successes/failures, outbox backlog, circuit breaker state changes (optional).
    - Wallet consumer: processed/acked, retry tier selected, DLQ routed.
* Rationale: not required, but materially improves debuggability and shows maturity.

11. Performance and Scalability
* Challenge-grade targets
  - P95 reads ≤ 200 ms, writes ≤ 400 ms locally under light load.
  - Availability target: 99.5% monthly (single instance).
* Known scale limits (document)
  - Balance aggregation is O(n) over transactions; future improvement = store balance with proper locking.
  - In-memory rate limiting not shared across instances; future improvement = shared store.

12. Risks and Mitigations
* Eventual consistency confusion (wallet 503)
  - Mitigation: README retry guidance; fixed Retry-After; optional status endpoint.
* RabbitMQ adds complexity
  - Mitigation: minimal topology; diagrams; management UI; integration tests.
* Concurrency edge cases on debit
  - Mitigation: document as out-of-scope; note production fix (DB tx + locks/idempotency).
* Outbox backlog if broker down
  - Mitigation: publisher retries; readiness can reflect broker status; logs/metrics for pending outbox.

13. Timeline and Milestones
* Day 1: Users register/login/me + DB migrations/seed; JWT middleware.
* Day 2: RabbitMQ compose + outbox publisher (confirms) + basic docs.
* Day 3: Wallet consumer + wallet gating 503 + wallet endpoints; retry ladder + DLQ; integration/e2e tests.
* Day 4: rate limiting + observability + CI + changelog (`standard-version`) + final polish + PR/merge evidence.

14. Acceptance Criteria (Definition of Done)
* Services
  - Users on 3002 and Wallet on 3001 run via Docker with dedicated Postgres DBs.
  - JWT enforced per requirements; secrets via env; no tokens committed.
* Auth
  - Register + login work; protected routes require JWT; authZ is self-only via `sub`.
* Provisioning
  - Register emits event; wallet is created exactly once per user (idempotent).
  - All wallet endpoints return `503` + `Retry-After: 2` until wallet exists.
* Messaging reliability
  - Retry ladder (10s/30s/120s) + DLQ configured and documented.
* Platform basics
  - Rate limiting present and configurable.
  - Minimal observability present (structured logs, requestId, /health/live, /health/ready).
* Process
  - Gitflow with at least one PR merged to main.
  - `CHANGELOG.md` automated via `standard-version` and documented.

15. Open Questions
* None blocking. Optional: confirm whether to include `/v1/wallet/status` for clarity (recommended but not required).

## Quick links
- [Back to README](../../README.md)
