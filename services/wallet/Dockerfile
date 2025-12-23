FROM oven/bun:1.1.38

WORKDIR /app

# Copy only what this service needs (plus workspace lockfile)
COPY bun.lock /app/bun.lock
COPY package.json /app/package.json
COPY services/wallet/package.json /app/services/wallet/package.json

WORKDIR /app/services/wallet
RUN bun install --frozen-lockfile

COPY services/wallet /app/services/wallet

EXPOSE 3001
CMD ["bun", "src/server.ts"]
