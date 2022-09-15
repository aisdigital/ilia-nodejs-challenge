# ília - Code Challenge NodeJS
**This project consists of three different applications**

## Environment variables

Each one of the projects need a .env file in order to work. This file must have the following fields:

```
DATABASE_URL=your mongodb database url
JWT_SECRET=JWT secret
JWT_ISSUER=JWT issuer
JWT_AUDIENCE=JWT audience
```

## Wallet

A wallet service that registers and lists the user transactions.

### How to run it

```
cd wallet
yarn
yarn dev
```

The application will be listening through the port 3001.

## User

A service that allows the creation of accounts that will be used for the transactions of the next application.

### How to run it

```
cd user
yarn
yarn dev
```

The application will be listening through the port 3002.

## Wallet GRPC

A wallet microservice that is consumed by the User application in order to register the user's transactions.

### How to run it

```
cd wallet-grpc
yarn
yarn dev
```

## Docker

You can also run a docker container with the desired application by navigating into that project's root folder and running the following command:

```
docker-compose up
```