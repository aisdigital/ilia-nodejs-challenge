#!/bin/sh
set -eu

DB_URL="${USERS_DATABASE_URL:-postgres://postgres:postgres@users-db:5432/users}"

echo "[users migrate] using DB: $DB_URL"
psql "$DB_URL" -f /app/services/users/migrations/001_create_users.sql
psql "$DB_URL" -f /app/services/users/migrations/002_create_outbox.sql
psql "$DB_URL" -f /app/services/users/migrations/003_split_name.sql
echo "[users migrate] done"
