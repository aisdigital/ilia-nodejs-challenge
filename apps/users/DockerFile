FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/transactions/package.json apps/transactions/package.json
COPY apps/users/package.json apps/users/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm install

COPY . .

WORKDIR /app/apps/users
EXPOSE 3002
CMD ["npm", "run", "start"]
