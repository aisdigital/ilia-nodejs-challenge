FROM node:alpine

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apk update && apk add git --no-cache && apk add shadow --no-cache

RUN groupmod -g ${GROUP_ID} node && usermod -u ${USER_ID} -g ${GROUP_ID} node

RUN mkdir /app && chown -R node:node /app

RUN npm -g install openapi-types && \
    npm -g install @apidevtools/swagger-cli

USER node

WORKDIR /app
