# Micro-service Wallet

## Como usar

### Configuração SetUp:

- Instale o [Node](https://nodejs.org/en/download/)

- Instale o [MongoDB](https://www.mongodb.com/try/download/community)

### Para rodar o backend:

Instale as dependências:

```bash
npm install
```
ou
```bash
yarn
```

### Crie um arquivo .env na pasta raíz (backend) de acordo com o .env.example

```
SERVER_PORT=                        # Prota do servidor da API (por default 3001)

MONGO_DB_URL_CONNECTION=            # URL do banco de dados
MONGO_DB_NAME=                      # Nome do banco de dados (por default ília-challenge)
MONGO_DB_COLLECTION=                # Nome da collection do MongoDB (por default transactions)

SECRET_JWT_TOKEN                    # Chave sercreta de reconhecimento do JWT Token (por default ILIACHALLENGE)
```

Builda o projeto:
```bash
npm run build
```
ou
```bash
yarn build
```

Inicie o servidor:
```bash
npm run start
```
ou
```bash
yarn start
```

## Stack Usada

### Backend
[Express](https://github.com/expressjs/express)   
[MongoDB](https://github.com/mongodb/mongo)
