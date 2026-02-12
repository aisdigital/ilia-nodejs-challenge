FROM node:alpine

WORKDIR /usr/app/users

COPY package*.json ./
RUN yarn install

COPY . .

EXPOSE 3001

CMD ["yarn", "start:dev"]