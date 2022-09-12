# Wallet API

[![Author](https://img.shields.io/badge/author-paulodevsilva-D54F44?style=flat-square)](https://github.com/paulodevsilva)
[![Stars](https://img.shields.io/github/stars/paulodevsilva/foodfy?color=D54F44&style=flat-square)](https://github.com/paulodevsilva/https://github.com/paulodevsilva/qualicorp-app.git)

> Wallet API.

# :pushpin: Table of Contents

- [Installation](#construction_worker-installation)
- [Technologies](#rocket-technologies)
- [Getting Started](#runner-getting-started)
- [Routes](#runner-routes)

## :rocket: Technologies

The following tools were used in this project:

- [Node.js](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)

# :construction_worker: Installation

**You need to install [Node.js](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/) first, then clone the repository.**

**Cloning Repository**

```
git clone https://github.com/paulodevsilva/https://github.com/paulodevsilva/iia-nodejs-challenge.git

```

**Install dependencies**

```
npm install or yarn install
```

**Insert environment variables**

```
MONGO_USERNAME='Your Credentials'
MONGO_PASSWORD='Your Credentials'
MONGO_NAME='Your Credentials'
MONGO_PORT='Your Credentials'
MONGO_URI='Your Credentials'

API_PORT='Your Credentials'
```

# :runner: Getting Started

Run the following command in order to start the application in a development environment:

```
yarn start:dev or npm run start:dev
```

Run the following command in order to start the application in docker:

```
docker-compose up -d
```

Run the following command in order to view logs the application in docker:

```
docker logs app-backend -f
```

Run the following command in order to start the application in a development environment:

```
yarn build or npm run build

yarn start or npm run start
```

# :runner: Routes

Authentication:

```js
url: {{base_url}}/auth/token
body: {
    username: string,
    password: string,
  }

# curl example

 curl --request POST \
  --url http://localhost:3001/auth/token \
  --header 'Content-Type: application/json' \
  --data '{
	 "username": "teste",
	 "password": "teste"
}'

```

Create Transaction:

```js
url: {{base_url}}/v1/transactions
body: {
    user_id: string,
    amount: number,
    type: enum  |  'CREDIT'  | 'DEBIT'
  }

# curl example

curl --request POST \
  --url http://localhost:3001/v1/transactions \
  --header 'Authorization: Bearer {{token}}' \
  --header 'Content-Type: application/json' \
  --data '{
  "user_id": "1236542da32",
  "amount": 10,
  "type": "CREDIT"
}'

```

Get all transactions:

```js
url: {{base_url}}/v1/transactions

# curl example

  curl --request GET \
  --url http://localhost:3001/v1/transactions/ \
  --header 'Authorization: Bearer {{token}}'

```

Get balance:

```js
url: {{base_url}}/v1/transactions/:user_id

# curl example

  curl --request GET \
  --url http://localhost:3001/v1/transactions/balance/1236542da32 \
  --header 'Authorization: Bearer {{token}}'

```
