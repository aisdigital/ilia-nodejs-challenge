FROM node:16
WORKDIR /opt/app
COPY package*.json ./
RUN yarn
COPY . .
EXPOSE 50051
CMD ["yarn", "dev"]