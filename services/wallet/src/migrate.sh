#!/bin/sh
set -euo pipefail

DB_URL="${WALLET_DATABASE_URL:-postgres://postgres:postgres@wallet-db:5432/wallet}"

echo "[wallet migrate] using DB: $DB_URL"
psql "$DB_URL" -f /app/services/wallet/migrations/001_create_wallets.sql
echo "[wallet migrate] done"
