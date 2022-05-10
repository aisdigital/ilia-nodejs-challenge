FROM node:16-alpine

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apk update && apk add --no-cache git && apk add shadow --no-cache

RUN groupmod -g ${GROUP_ID} node && usermod -u ${USER_ID} -g ${GROUP_ID} node

RUN mkdir /app && chown -R node:node /app

RUN npm install -g @nestjs/cli --verbose

USER node

WORKDIR /app
