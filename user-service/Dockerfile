FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma

RUN npm run prisma:generate

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init postgresql openssl

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

COPY prisma ./prisma

RUN npm run prisma:generate

COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

ENV WALLET_SERVICE_URL=http://wallet-service:3001

EXPOSE 3002

ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]
