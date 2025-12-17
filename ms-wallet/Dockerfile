FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]