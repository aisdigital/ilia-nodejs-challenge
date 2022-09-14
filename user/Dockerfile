FROM node:alpine
WORKDIR /opt/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 3002
CMD ["yarn", "dev"]