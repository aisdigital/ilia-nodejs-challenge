# Build stage
FROM node:20.19.0-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source
COPY apps/wallet-service ./apps/wallet-service
COPY proto ./proto
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY .swcrc ./

# Build the application
RUN npm run build:wallet

# Production stage
FROM node:20.19.0-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application and proto from builder
COPY --from=builder /build/dist/apps/wallet-service ./dist
COPY --from=builder /build/dist/apps/proto ./proto

# Expose ports
EXPOSE 3001 50053

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/src/main.js"]
