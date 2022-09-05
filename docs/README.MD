# Tecnologies used

- [Node](https://nodejs.org/pt/)
- [JWT](https://jwt.io)
- [Express](https://expressjs.com/pt-br/)
- [Postgres](https://www.postgresql.org)
- [Prisma](https://www.prisma.io)
- [Docker](https://www.docker.com)

## Wallet Microservice

## Overview

A Wallet app that positive and negative transactions and storage all the exchanges in the postgres database. You need to specify what transaction you want to do (**CREDIT** OR **DEBIT**) and the amount in number.

#
## Running the project

To run the wallet microsservice make a git clone in this repo, after this enter in the directory and type the command:
```docker
cd users/
	docker image build -t users_app .

cd wallet/
	docker image build -t wallet_app .

cd users/
docker-compose up --build
```
This command will up the postgres database and two microsservices (**users** and **wallet**), 
the microservices are running on port **3001** and **3002** and the database in the default port 5432.

#

## Endpoint

The wallet microservice has 4 available endpoints:

### /transactions/?type=""
This endpoint returns all transactions filtering by type in the database

example response:

```json
[
	{
		"user_id": "e72e1d5d-8cc6-4177-9aad-28db2951e456",
		"amount": 555555,
		"type": "CREDIT",
		"id": "8a1933553fc0aa7c3bdaa17c5aaaeb9a"
	}
]
```
#

### /transactions/balance/?user_id=""
This endpoint returns all balances filtering per user_id

example response:
```json 
{
	"amount": 0
}
```
#

### /transactions/balance
This endpoint returns all balances in amount adding the total of transactions done.

example response: 
```json
{
	"amount": 555555
}
```
#

### /transactions/post
This endpoint will registry the transaction made in the database, returning 2 more informations (**user_id** and **id**)

example response:

```json 
  {
	"user_id": "e72e1d5d-8cc6-4177-9aad-28db2951e456",
	"amount": 0,
	"type": "CREDIT",
	"id": "8a1933553fc0aa7c3bdaa17c5aaaeb9a"
}
```

#


### Users microservice

A simple crud with authentication that allows create, read, read-by-id, update and delete user. To make these 4 operations (**read, read-by-id, update and delete**) the user need to be authenticate in the login endpoint.

#

## Endpoints

**NON-REQUIRED AUTH ENDPOINTS**
### /users/createuser
The createuser endpoint will return some data validating that was sucesfully created.

example response: 

```json
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

### /login/
The login endpoint will return, if user exists in the database, a authetication token to make other request in the endpoints that are required the authentication.

example response: 

```json 
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3R0QHRlc3QuY29tIiwiaWF0IjoxNjYyMzM1ODM3LCJleHAiOjE2NjIzMzY3MzcsInN1YiI6IjdkZDY1NDgxLWE2NTMtNDhlOS04ZDA2LWRmYWRmN2E4YzY5YiJ9.hBFyvNkhhkyrn-fciHTeXrhsymN0B0E21JLrVheo2KU"
}
```
#

**After generate the token you can make requests in the endpoints below.**

#
**REQUIRED AUTH ENDPOINTS**
### /users/findusers
This endpoint will return all registred users in the database.

example response: 
```json
[
	{
	"id": "330c62cf-f999-41c4-a0da-ea926a6e9fea",
	"first_name": "string",
	"last_name": "string",
	"email": "string@test.com"
	}
]

[
	{
	"id": "665eda21-a194-67b1-a10a-a21254d34a6ff",
	"first_name": "string",
	"last_name": "string",
	"email": "test@test.com"
	}
]

```
#

### /users/finduser/:id 
This endpoint will return an unique user by id passed request params.

example response: 

```json
{
	"id": "330c62cf-f999-41c4-a0da-ea926a6e9fea",
	"first_name": "string",
	"last_name": "string",
	"email": "string"
}
```
#

### /users/updateuser/:id
This endpoint allow us update the data of an user passing the id in the endpoint params.

example request body: 

```json
{
	"id": "330c62cf-f999-41c4-a0da-ea926a6e9fea",
	"first_name": "string",
	"last_name": "string",
	"email": "test@test.com"
}
```

example response: 
```json
	{
	"id": "330c62cf-f999-41c4-a0da-ea926a6e9fea",
	"first_name": "foo",
	"last_name": "bar",
	"email": "string@string.com"
}
```
#

### /users/deleteuser/:id
This endpoint will return only the status code showing that request was successfully made passing the id in the endpoint params.


## Environments
The environment variables to connect with DB and generate secret

```env
POSTGRES_USER=""     # DATABASE USER
POSTGRES_PASSWORD=""     # DATABASE PASSWORD
POSTGRES_DB=""   # DATABASE NAME

DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB>?schema=public"

JWT_SECRET_TOKEN_TRANSACTIONS="ILIADIGITAL" BY DEFAULT
JWT_SECRET_TOKEN_USERS="ILIACHALLENGE_INTERNAL" BY DEFAULT
```
#

## DISCLAIMER
There aren't any volume saved. To run all the project need to download the images in dockerfile before
compose all the containers and in the images have a command to generate the migrations in the container DB.
**there are no persisted data in the DB**

## LICENSE: 
### APACHE 2.0

