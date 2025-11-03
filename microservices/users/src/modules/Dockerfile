FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @nestjs/cli

COPY . .
RUN apk add --no-cache python3 py3-pip && pip install awscli
RUN npm run build 

FROM node:20-alpine AS production

ENV PORT=3002
EXPOSE ${PORT}
EXPOSE 50051

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .

COPY microservices/users/setup-localstack.sh . 

CMD ["npm", "run", "start:prod"]