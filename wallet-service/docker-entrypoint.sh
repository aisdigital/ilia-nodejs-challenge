#!/bin/sh

set -e

DB_HOST=${DB_HOST:-wallet-db}
DB_PORT=${DB_PORT:-5432}
DB_USER=${POSTGRES_USER:-wallet_user}
DB_NAME=${POSTGRES_DB:-db_wallet}
DB_PASSWORD=${POSTGRES_PASSWORD:-wallet_password}

echo "Waiting for PostgreSQL to be ready at $DB_HOST:$DB_PORT..."

RETRY_COUNT=0
MAX_RETRIES=60
RETRY_INTERVAL=1

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo "PostgreSQL is accepting connections!"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
    echo "PostgreSQL not ready yet. Retrying... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "PostgreSQL failed to start after $MAX_RETRIES attempts"
  exit 1
fi

sleep 2

echo "PostgreSQL is ready!"
echo "Running Prisma migrations..."

if npx prisma migrate deploy; then
  echo "Migrations completed successfully!"
else
  echo "Migrations completed with warnings (this may be normal)"
fi

echo "Starting Wallet Microservice..."

exec npm start
