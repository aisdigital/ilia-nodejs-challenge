FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/infrastructure/database/migrations ./src/infrastructure/database/migrations
COPY --from=builder /app/src/infrastructure/database/data-source.ts ./src/infrastructure/database/data-source.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN npm install --save-dev typescript ts-node @types/node

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3002

CMD ["./docker-entrypoint.sh"]
