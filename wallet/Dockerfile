FROM node:alpine
WORKDIR /opt/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 3001
CMD ["yarn", "dev"]