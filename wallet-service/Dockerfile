# Multi-stage build for the Wallet Microservice
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client before build
RUN npm run prisma:generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling and postgresql for pg_isready utility
RUN apk add --no-cache dumb-init postgresql openssl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma Client
RUN npm run prisma:generate

# Copy docker entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port 3001
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]
