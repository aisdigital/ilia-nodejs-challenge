FROM node:alpine
WORKDIR /opt/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 3334
CMD ["yarn", "dev"]