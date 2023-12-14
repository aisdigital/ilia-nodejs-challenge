FROM node:18

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY prisma ./prisma/
COPY .env ./
COPY tsconfig.json ./

RUN yarn install

COPY . .

RUN yarn db:generate

EXPOSE 3001

CMD ["yarn", "start"]
