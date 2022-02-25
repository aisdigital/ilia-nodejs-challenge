# Wallet

### English

## Overview

A wallet that stores transactions informations in a MongoDB. It is possible to: add transactions, see all transactions of a specified type (CREDIT or DEBIT) and check for the balance (CREDIT - DEBIT).

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

### **/balance**

This endpoint does not need any other information. It returns the sum of all credits minus the sum of all debits.
Example response of a balance endpoint:

```
{
	"amount": 50
}
```

## POST

### **/transactions**

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

### **/balance**

Este endpoint não precisa de nenhuma outra informação. Ele retorna a soma de todos os créditos menos a soma de todos os débitos.
Exemplo de resposta:

```
{
	"amount": 50
}
```

## POST

### **/transactions**

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
