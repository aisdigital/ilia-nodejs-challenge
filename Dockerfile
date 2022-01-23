FROM node:alpine

WORKDIR /usr/app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]