#!/usr/bin/env bash
set -euo pipefail

# Simple helper to bring up infra, build services and run a smoke flow (create user, login, create tx, check balance).
# Usage: ./scripts/run-local-flow.sh
# Requirements: docker, docker-compose, npm, jq (optional)

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "1/9 - Prepare .env.local"
cp .env.example .env.local || true
# You can edit .env.local here if needed

echo "2/9 - Install deps"
npm ci

echo "3/9 - Start infra (Postgres +/- Kafka)"
docker compose up -d --build

echo "4/9 - Wait for Postgres (wallet)"
for i in {1..60}; do
  if pg_isready -h localhost -p 5433 -U postgres >/dev/null 2>&1; then
    echo "postgres-wallet is ready"; break
  fi
  echo "waiting for postgres-wallet... ($i)"; sleep 1
done

echo "5/9 - Build services"
npm run build:users
npm run build:wallet

echo "6/9 - Start services (prod mode)"
# Start users
npm run start:prod:users &
PID_USERS=$!
# Start wallet
npm run start:prod:wallet &
PID_WALLET=$!

# Ensure we kill on exit
cleanup() {
  echo "Cleaning up: killing services and docker"
  kill -9 "$PID_USERS" 2>/dev/null || true
  kill -9 "$PID_WALLET" 2>/dev/null || true
  docker compose down --volumes || true
}
trap cleanup EXIT

# Wait for endpoints
echo "7/9 - Waiting for HTTP endpoints"
for i in {1..60}; do
  if curl -sS -f http://localhost:3002/healthz >/dev/null 2>&1 || curl -sS -f http://localhost:3002/ >/dev/null 2>&1; then
    echo "users service is up"; break
  fi
  echo "waiting for users... ($i)"; sleep 1
done

for i in {1..60}; do
  if curl -sS -f http://localhost:3001/healthz >/dev/null 2>&1 || curl -sS -f http://localhost:3001/ >/dev/null 2>&1; then
    echo "wallet service is up"; break
  fi
  echo "waiting for wallet... ($i)"; sleep 1
done

echo "8/9 - Running smoke flow"
# Create user
CREATE_RESP=$(curl -s -X POST http://localhost:3002/users -H "Content-Type: application/json" -d '{"first_name":"Auto","last_name":"Test","email":"auto@example.com","password":"123456"}')
echo "Create user response: $CREATE_RESP"

# Login
LOGIN_RESP=$(curl -s -X POST http://localhost:3002/auth -H "Content-Type: application/json" -d '{"email":"auto@example.com","password":"123456"}')
TOKEN=$(echo "$LOGIN_RESP" | jq -r '.access_token' 2>/dev/null || true)
echo "Token: $TOKEN"

# Create transaction
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  TX_RESP=$(curl -s -X POST http://localhost:3001/transactions -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"type":"CREDIT","amount":100}')
  echo "Create tx response: $TX_RESP"
  # Fetch balance
  USER_ID=$(echo "$CREATE_RESP" | jq -r '.id' 2>/dev/null || true)
  BALANCE=$(curl -s -X GET http://localhost:3001/balance/${USER_ID} -H "Authorization: Bearer $TOKEN" || true)
  echo "Balance: $BALANCE"
else
  echo "No token received; aborting tx test"
fi

echo "9/9 - Flow done"
# cleanup will run via trap
