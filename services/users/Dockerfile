FROM oven/bun:1.1.38

WORKDIR /app

# Copy only what this service needs (plus workspace lockfile)
COPY bun.lock /app/bun.lock
COPY package.json /app/package.json
COPY services/users/package.json /app/services/users/package.json

WORKDIR /app/services/users
RUN bun install --frozen-lockfile

COPY services/users /app/services/users

EXPOSE 3002
CMD ["bun", "src/server.ts"]
