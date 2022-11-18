# User and Wallet Service

## Instalação

entre na pasta user-microservice e instale as dependencias do package.json

```bash
  cd  user-microservice

  yarn
```

levante o banco de dados com o comando

```bash
docker-compose up -d
```

em seguida rode as migration do banco de dados

```bash
  npx prisma migrate dev
```

para rodar a aplicaão rode o comando

```bash
yarn start:dev
```

Para levantar o serviço do transaction-microservice, faça o mesmo processo citado a cima.

## Variáveis de Ambiente

Para rodar esse projeto, você vai precisar adicionar as seguintes variáveis de ambiente no seu .env

` PORT=`

`ILIACHALLENGE_INTERNAL=` para o user-microservice e

`ILIACHALLENGE` para o transaction-microservice

`DATABASE_URL=`
`POSTGRES_USER=`
`POSTGRES_PASSWORD=`
`POSTGRES_DB=`

`TRANSACTION_MS_API=` aqui você pode colocar o endereço do transaction microservice

## Documentação da API - user-microservices

todas as rotas deverão ser requestadas neste serviço

#### Criação do usuário

```http
  POST /user
```

| Body        | Tipo     | Descrição                     |
| :---------- | :------- | :---------------------------- |
| `email`     | `string` | **Obrigatório**               |
| `fristName` | `string` | **Obrigatório** Primeiro Nome |
| `lastName`  | `string` | **Obrigatório** Ultimo Nome   |
| `password`  | `string` | **Obrigatório** Senha         |

#### Autenticação do usuario

```http
  POST /auth
```

| Body    | Tipo     | Descrição       |
| :------ | :------- | :-------------- |
| `email` | `string` | **Obrigatório** |
| `senha` | `string` | **Obrigatório** |

#### Alteração de cadastro do usuário

Para realizar esta ação, é necessáio ter o access_token para autenticar na rota, logo necesita-se que faça o login

Rota autenticada por JWT - Bearer Token

```http
  PATCH /user/{:id}
```

| Parâmetro      | Tipo     | Descrição                                          |
| :------------- | :------- | :------------------------------------------------- |
| `id`           | `string` | **Obrigatório**. O ID do usuario que será alterado |
| `access_token` | `string` | **Obrigatório**. Token JWT                         |

No Body, coloque o campo que deseja alterar

#### Criar transação

```http
  POST /transaction
```

Rota autenticada por JWT - Bearer Token

| Body     | Tipo     | Descrição                                          |
| :------- | :------- | :------------------------------------------------- |
| `userId` | `number` | **Obrigatório** userId do usuario                  |
| `type`   | `string` | **Obrigatório** O campo aceita 'DEBIT' ou 'CREDIT' |
| `amount` | `number` | **Obrigatório** valor a ser enviado                |

#### Retorna o extrato consolidado por type

```http
  POST /balance
```

Rota autenticada por JWT - Bearer Token

## Autores

- [@arturparanayba](https://www.github.com/arturparanayba)
