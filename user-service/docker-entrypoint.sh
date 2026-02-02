#!/bin/sh

echo "Waiting for database to be ready..."

while ! nc -z db_users 5432; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database is ready!"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting User Microservice..."
npm start
