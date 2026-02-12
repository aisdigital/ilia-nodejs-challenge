FROM node:alpine

WORKDIR /usr/app/users

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn prisma generate

EXPOSE 3002

CMD ["sh", "-c", "yarn prisma migrate dev && yarn start:dev"]