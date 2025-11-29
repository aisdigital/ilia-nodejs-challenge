# ília - Code Challenge NodeJS

Implementation of the ília Code Challenge in Node.js over Nest.js framework.

## Before starting

#### .env files

Create the following .env files in each project root folder.

For the `Users` service:
```
SERVICE_NAME=users
USER_JWT_SECRET_KEY=ILIACHALLENGE
USER_JWT_TTL_IN_SECONDS=600
USER_PASSWORD_SALT=mycoolsalt
INTERNAL_JWT_SECRET_KEY=ILIACHALLENGE_INTERNAL
WALLET_SERVICE_URL=http://localhost:3001
DATABASE_URL=file:./dev.db
```

For the `Wallet` service:

```
SERVICE_NAME=wallet
INTERNAL_JWT_SECRET_KEY=ILIACHALLENGE_INTERNAL
USERS_SERVICE_URL=http://localhost:3002
ALLOWED_SERVICES=users.ilia-nodejs-challenge
DATABASE_URL=file:./dev.db
```
#### Build the database

Run the following commands to init and build the database:

```bash
$ cd users
$ npm install
$ npx prisma migrate dev --name init
$ npx prisma generate

$ cd ../wallet
$ npm install
$ npx prisma migrate dev --name init
$ npx prisma generate
```

## Running services

To run the services, execute the following command in a dedicated terminal opened in the project's folder:

```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

Remember to run each service in a different port.


## REST APIs

#### Create user
```http
POST http://localhost:3002/user HTTP/1.1
Content-Type: application/json

{
    "name": "John Doe",
    "email": "johndoe@test.com",
    "password": "mycoolpassword"
}
```

#### Generate JWT for the user:

```http
POST http://localhost:3002/token HTTP/1.1
Content-Type: application/json

{
    "email": "johndoe@example.com",
    "password": "mycoolpassword"
}
```

#### Operate stocks

```http
POST http://localhost:3002/wallet/buy HTTP/1.1
Authorization: Bearer mycooltoken
Content-Type: application/json

{
    "stock": "AAPL",
    "quantity": 10
}
```

```http
POST http://localhost:3002/wallet/sell HTTP/1.1
Authorization: Bearer mycooltoken
Content-Type: application/json

{
    "stock": "NKE",
    "quantity": 2
}
```

#### Get wallet

```http
GET http://localhost:3002/wallet HTTP/1.1
Authorization: Bearer mycooltoken
```

#### Delete current user

> Deleting the current user will also delete any associated wallet and stocks

```http
DELETE http://localhost:3002/user HTTP/1.1
Authorization: Bearer mycooltoken
```
