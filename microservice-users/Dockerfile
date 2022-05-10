FROM node:16-alpine as dependencies

WORKDIR /app
COPY ./package.json ./package-lock.json /app/
RUN npm ci --production

FROM node:16-alpine

LABEL maintainer=""

RUN addgroup --system --gid 10001 service && \
  adduser application --system --ingroup service --uid 10001

COPY --chown=application:service ./dist /home/application/dist
COPY --chown=application:service ./package.json ./package-lock.json /home/application/
COPY --chown=application:service --from=dependencies /app/node_modules /home/application/node_modules

USER application
WORKDIR /home/application

EXPOSE 3000

CMD node dist/main
