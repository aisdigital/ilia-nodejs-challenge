
FROM node:18-alpine

# Working directory inside the container
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3001

# Define the command to start the application
CMD ["yarn", "start:prod"]