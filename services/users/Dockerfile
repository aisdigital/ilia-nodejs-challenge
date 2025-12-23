FROM oven/bun:1.1.38

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

ENV BUN_INSTALL_CACHE=/app/node_modules/.bun

# Copy workspace manifests
COPY bun.lock /app/bun.lock
COPY package.json /app/package.json
COPY services/users/package.json /app/services/users/package.json
COPY services/wallet/package.json /app/services/wallet/package.json

RUN bun install --frozen-lockfile --backend=copyfile

COPY services/users /app/services/users
RUN rm -rf /app/services/users/node_modules && ln -s /app/node_modules /app/services/users/node_modules
WORKDIR /app/services/users

EXPOSE 3002
CMD ["bun", "src/server.ts"]
