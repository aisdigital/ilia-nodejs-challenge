FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3001-3001

RUN yarn prisma generate

CMD ["yarn", "start"]