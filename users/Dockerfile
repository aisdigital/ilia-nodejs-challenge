FROM node:16

WORKDIR /users

COPY . /users/

RUN npm install

EXPOSE 3002

CMD [ "npx", "ts-node", "src/main.ts" ]