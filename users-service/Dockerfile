FROM node:alpine as base

WORKDIR /home/node/users

COPY ./package.json .

RUN npm i

COPY . .