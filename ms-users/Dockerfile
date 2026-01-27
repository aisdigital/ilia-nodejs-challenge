FROM node:22-alpine AS builder

WORKDIR /app

COPY ms-users/package*.json ./
RUN npm ci

COPY ms-users/. .
COPY proto /proto

# Copy generated proto types to src/grpc/generated
RUN mkdir -p src/grpc/generated && cp -r /proto/generated/* src/grpc/generated/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY ms-users/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /proto /proto

EXPOSE 3002

CMD ["node", "dist/server.js"]
