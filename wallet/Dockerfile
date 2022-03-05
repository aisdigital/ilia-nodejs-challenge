FROM node:alpine

WORKDIR /home/node/wallet

COPY package*.json yarn.lock ./

RUN npm i

COPY . .

EXPOSE 3001

CMD npm run dev