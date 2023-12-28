FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3002-3002

RUN yarn prisma generate

CMD ["yarn", "start"]