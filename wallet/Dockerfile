FROM node:16

WORKDIR /wallet

COPY . /wallet/

RUN npm install

EXPOSE 3001

CMD [ "npx", "ts-node", "src/main.ts" ]