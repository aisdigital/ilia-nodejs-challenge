# Base image for building the application
FROM node:20-alpine3.20 AS builder
WORKDIR /app

# Argument for service name and CI job token
ARG SERVICE_NAME=wallet-service

# Copy the necessary files
COPY package.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY src ./src
COPY prisma/ ./prisma

RUN npm install


RUN npx prisma generate --schema=./prisma/schema.prisma


# Install dependencies

# Build the application
RUN npm run build

# Final image for running the application
FROM node:20-alpine3.20 AS runner
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/nest-cli.json ./
COPY --from=builder /app/openapi.yaml ./


# Set up non-root user for running the application
RUN addgroup --system --gid 1001 expressjs && \
    adduser --system --uid 1001 expressjs
USER expressjs

EXPOSE 8080
CMD ["npm", "run", "start:prod"]