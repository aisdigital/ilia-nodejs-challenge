FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .
RUN npm run build

FROM node:20-alpine AS production

ENV PORT=3002
EXPOSE ${PORT}
EXPOSE 50051

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY src/shared/grpc/*.proto ./dist/shared/grpc/
COPY package.json .

CMD ["npm", "run", "start:prod"]