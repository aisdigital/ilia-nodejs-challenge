FROM node:16
WORKDIR /opt/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 3002
CMD ["yarn", "dev"]