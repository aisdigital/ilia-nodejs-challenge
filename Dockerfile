FROM node:20-alpine AS development

WORKDIR /app

COPY wallet-service/package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS build

WORKDIR /app

COPY wallet-service/package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY wallet-service/package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]