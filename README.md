# Wallet

### English

## Overview

A wallet that stores transactions informations in a MongoDB. It is possible to: add transactions, see all transactions of a specified type (CREDIT or DEBIT) and check for the balance (CREDIT - DEBIT).

## Runing the server and database

To run the program you need to have docker and docker-compose installed in your machine. Also, it is necessary to export a environment variable called JWT_KEY, that is the private key used for the JWT generation. Then, it is only needed to clone this repository, enter the repository folder and run:

```sh
docker-compose build
docker-compose up
```

## Authentication

Every endpoint uses a Bearer Token JWT authentication. It is needed to acces every information in the server.

## Endpoints

The endpoints are made of two types of requests:

### GET

#### **/transactions?type**

This endpoint returns every transaction of a specific type (CREDIT OR DEBIT), that is passed as a query. It is either _/transactions?type=CREDIT_ or _/transactions?type=DEBIT_.
Example response of a credit query:

```
[
  {
    "id": "string",
    "user_id": "string",
    "amount": 100,
    "type": "CREDIT"
  },
  {
    "id": "string",
    "user_id": "string",
    "amount": 50,
    "type": "CREDIT"
  }
  ...
]
```

#### **/balance**

This endpoint does not need any other information. It returns the sum of all credits minus the sum of all debits.
Example response of a balance endpoint:

```
{
	"amount": 50
}
```

### POST

#### **/transactions**

This endpoint is used for adding info to the database. It needs a body in JSON format using the following syntax:

```
{
  "user_id": string,
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

It returns a JSON response:

```
{
  "id": string,
  "user_id": string,
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

### Português

## Resumo

Uma carteira que guarda as informações de transações em um MongoDB. É possível: adicionar transações, ver todas as transações de um tipo específico (CRÉDITO ou DÉBITO) e verificar o balanço (CRÉDITO - DÉBITO).

## Rodando o servidor e o banco de dados

Para rodar o programa, só é necessário ter docker e docker-compose instalados na sua máquina. Então, basta clonar o repositório, entrar na pasta do repositório e rodar:

```sh
docker-compose up
```

## Autenticação

Todo endpoint usa uma autenticação do tipo Bearer Token com JWT. Esse token é necessário para acessar todas as informações do servidor.

## Endpoints

Os endpoints são de dois tipos:

### GET

#### **/transactions?type**

Esse endpoint retorna todas as transações de um tipo específico (CRÉDITO ou DÉBITO), que é passado como uma query. Sendo _/transactions?type=CREDIT_ ou _/transactions?type=DEBIT_.
Exemplo de uma resposta de crédito

```
[
  {
    "id": "string",
    "user_id": "string",
    "amount": 100,
    "type": "CREDIT"
  },
  {
    "id": "string",
    "user_id": "string",
    "amount": 50,
    "type": "CREDIT"
  }
  ...
]
```

#### **/balance**

Este endpoint não precisa de nenhuma outra informação. Ele retorna a soma de todos os créditos menos a soma de todos os débitos.
Exemplo de resposta:

```
{
	"amount": 50
}
```

### POST

#### **/transactions**

Este endpoint é utilizado para adicionar informação ao banco de dados. É necessário um corpo no formato JSON usando a sintaxe:

```
{
  "user_id": string,
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

A resposta em JSON:

```
{
  "id": string,
  "user_id": string,
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

# Users

### English

## Overview

This is a server for managing users info. This server is used to communicate with the wallet microservice in order to manage users transactions. It is possible to see every user and add new ones. To the users already in the database, it is possible to update and delete the information. Besides managing user information, it can also access every wallet server functionality for specific users.

## Runing the server

As with the wallet server, this server can be run with a docker-compose. Also similar to the wallet program, you need to export the JWT_KEY environment variable, as well as another variable (INT_JWT) for the authentication of the communications of the servers. After exporting those varibles, all that is needed is to clone this repository and entering its folder. Then run the docker-compose with the users profile:

```sh
docker-compose --profile users build
docker-compose --profile users up
```

The profile flag is used to indicate to the docker-compose to build and run the users server. If not used, the only thing built by the docker-compose will be the database and the wallet server.

## Authentication

This server also uses a JWT authentication. First, the new user should be added to the database, then it is needed to send the email and password saved in the database to the _/auth_ endpoint. In this endpoint, it is generated a token that needs to be passed to every other endpoint in the server as Authorization: Bearer.

## Endpoints

The endpoints can be for user information management, user transaction management or authorization token generation.

### Authorization

#### POST

##### **/auth**

To get a token, first one should add the user info to the database, through the POST /users route. Then, said user can be assigned an authoriztion token through this endpoint, using the user email and password. The body format of the request should be:

```
{
  "user": {
    "email": "string",
    "password": "string"
  }
}
```

Then, the server will respond with a token to be passed in the header (Authorization: Bearer 'generated-token') of the other endpoints:

```
{
  "user": {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  "access_token": "string"
}
```

### User info

#### GET

##### **/users**

This endpoint does not need any request parameters or queries. It returns the list of users in the database:

```
[
  {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  ...
]
```

##### **/users/:id**

This endpoint needs an id parameter and it needs to be an user id that is already in the database. If it is not in the database, the server sends a 404 status. If it is a valid user id, the server responds with the info of said user:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### POST

##### **/users**

This endpoint is used to add new users to the database. If the user id or the user email provided are already in the system, the server will answer with a 409 status code. The body should follow the format:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string",
  "email": "string"
}
```

And the response will be:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### PATCH

##### **/users/:id**

This endpoint is for updating a user (specified by the id parameter) information. This path also prevents the use of ids and emails already in use, sending a 409 status. In case of a user id that is not in the database, the server sends a 404 status.
The body is equal in format as the post users route:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string",
  "email": "string"
}
```

And the response too:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### DELETE

##### **/users/:id**

This route can be used to delete information for a specific user. It only requires an id parameter and, in case that the user id is not in the database, a 404 status is sent.

### Transactions info

These endpoints follow a similar syntax to the wallet endpoints, but use the users id to get specific users information.

#### GET

##### **/transactions/:id?type**

This endpoint return every logged transaction of a type (CREDIT or DEBIT) for that specific user id:

```
[
  {
    "id": "string",
    "user_id": "string",
    "amount": number,
    "type": "CREDIT"/"DEBIT"
  },
  {
    "id": "string",
    "user_id": "string",
    "amount": number,
    "type": "CREDIT"/"DEBIT"
  }
  ...
]
```

##### **/balance/:id**

This endpoint returns the balance of a specific user. It is the result of calculating the sum of every credit to that user id minus the sum of every debit. It returns:

```
{
  "amount": 0
}
```

#### POST

##### **/transactions**

This endpoint adds a new transaction to the wallet database, using the following body format:

```
{
  "user_id": "string",
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

And the response:

```
{
  "id": "string",
  "user_id": "string",
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

### Português

## Resumo

Esse é um server para gerenciar informações de usuários. Ele é usado para comunicar com o microsserviço wallet para gerenciar as transações dos usuários. É possível ver todos os usuários e adicionar um novo usuário. Para os usuários que já estão no banco de dados, é possível atualizar e deletar suas informações. Além de gerenciar informações de usuários, também é possível acessar todas as funcionalidades do servidor wallet para um usuário específico.

## Runing the server

Como no servidor wallet, esse servidor pode ser rodado com um docker-compose. Também similar ao programa wallet, é necessário que se exporte a variável de ambiente JWT_KEY, além de outra variável (INT_JWT) para a autenticação das comunicações dos servidores. Depois de exportar essas variáveis, somente é necessário clonar esse repositório e entrar na pasta. Então rodar o docker-compose com o profile users:

```sh
docker-compose --profile users build
docker-compose --profile users up
```

A flag profile é utilizada para inficar ao docker-compose para rodar o servidor users. Caso não seja usada, o que será rodado pelo docker-compose será somente o banco de dados e o servidor wallet.

## Authentication

Esse servidor também utiliza um JWT como autenticação. Primeiramente, um novo usuário deve ser adicionado ao banco de dados, então é necessário enviar o email e a senha salvas para o _/auth_ endpoint. Nele, é gerado um token que precisa ser passado para todos os demais endpoints do servidor como Authorization: Bearer.

## Endpoints

Os endpoints podem ser para gerenciamento de informções do usuário, transações do usuário ou geração do token de autorização.

### Autorização

#### POST

##### **/auth**

Para receber um token, primeiro é preciso adicionar o usuário ao banco de dados pela rota POST /users. Então, o usuário pode receber um token de autorização através deste endpoint, usando o email e a senha. O formato do corpo do pedido deve ser:

```
{
  "user": {
    "email": "string",
    "password": "string"
  }
}
```

Então, o servidor responderá com um token para ser passado no header (Authorization: Bearer 'token-gerado') dos demais endpoints:

```
{
  "user": {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  "access_token": "string"
}
```

### Informação dos usuários

#### GET

##### **/users**

Esse endpoint não precisa de nenhum parâmetro ou query. Ele retorna a lista de usuários do banco de dados:

```
[
  {
    "id": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  ...
]
```

##### **/users/:id**

Este endpoint precisa de um parêmetro id, sendo que precisa ser de um id de usuário que já está no banco de dados. Se não estiver no banco de dados, o servidor envia um status 404. Se for um id válido, o servidor responde com a informação do usuário:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### POST

##### **/users**

Este endpoint é usado para adicionar novos usuários ao banco de dados. Se o id de usuário ou o email passados já estiverem no sistema, o servidor responderá com um status 409. O corpo do pedido deve seguir o formato:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string",
  "email": "string"
}
```

E a resposta será:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### PATCH

##### **/users/:id**

Este endpoint é para atualizar a informação de um usuário (especificado pelo parâmetro id). Esse endereço impede o uso de ids e emails que já estejam sendo usados, enviado um status 409. No caso de um id que não está no banco de dados, o servidor envia um status 404.
O formato do corpo é igual ao da rota post users:
The body is equal in format as the post users route:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string",
  "email": "string"
}
```

E a resposta também:

```
{
  "id": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

#### DELETE

##### **/users/:id**

Esta rota é usada para deletar informações de um usuário específico. Só é necessário o parâmetro id. No caso do id de usuário não estar no banco de dados, um status 404 é enviado.

### Transactions info

Esses endpoints seguem uma sintaxe similar aos endpoints da wallet, mas usam as id de usuários para conseguir as informações de usuários específicos.

#### GET

##### **/transactions/:id?type**

Este endpoint retorna todas as transações de um tipo (CRÉDITO ou DÉBITO) registradas para aquele id de usuário específico:

```
[
  {
    "id": "string",
    "user_id": "string",
    "amount": number,
    "type": "CREDIT"/"DEBIT"
  },
  {
    "id": "string",
    "user_id": "string",
    "amount": number,
    "type": "CREDIT"/"DEBIT"
  }
  ...
]
```

##### **/balance/:id**

Este endpoint retorna o saldo de um usuário específico. É o resultado do cálculo da soma de todos os créditos daquele usuário menos todos os débitos. Ele retorna:

```
{
  "amount": 0
}
```

#### POST

##### **/transactions**

Este endpoint adiciona uma nova transação ao banco de dados wallet, usando o seguinte formato de body:

```
{
  "user_id": "string",
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```

E a resposta é:

```
{
  "id": "string",
  "user_id": "string",
  "amount": number,
  "type": "CREDIT"/"DEBIT"
}
```
