FROM node:22-alpine as builder

WORKDIR /app

COPY ms-wallet/package*.json ./
RUN npm ci

COPY ms-wallet/. .
COPY proto /proto

# Copy generated proto types to src/grpc/generated
RUN mkdir -p src/grpc/generated && cp -r /proto/generated/* src/grpc/generated/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY ms-wallet/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /proto /proto

EXPOSE 3001 50051

CMD ["node", "dist/server.js"]