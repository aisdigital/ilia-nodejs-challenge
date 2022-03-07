<h1 align="center">
  Wallet
</h1>

<p align="center">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/JonasCastro/ilia-nodejs-challenge">

  <a href="https://github.com/JonasCastro/ilia-nodejs-challenge/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/JonasCastro/ilia-nodejs-challenge">
  </a>
    
   <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">

  <a href="https://www.linkedin.com/in/jonas-castro-b4044111a/">
    <img alt="Feito por Jonas" src="https://img.shields.io/badge/feito%20por-Jonas-%237519C1">
  </a>
  
 
 
</p>

<h4 align="center"> 
	 🚧 Microsserviço Wallet 🚧 Concluído ✅
</h4>

<p align="center">
 <a href="#-sobre-o-projeto">Sobre</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#wrench-funcionalidades">Funcionalidades</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#fax-endpoint">Endpoints</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#rocket-como-executar-o-projeto">Como executar</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#computer-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#autor">Autor</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
 <a href="#memo-licença">Licença</a>
</p>

## 💻 Sobre o projeto

:bar_chart: Wallet é uma Carteira digital com o objetivo de registrar transações de usuário.
Solução do [ília - Code Challenge NodeJS](https://github.com/aisdigital/ilia-nodejs-challenge)

---
## :wrench: Funcionalidades

- [x] Registrar as transações dos usuários:
- [x] Listar as transações registradas:
  - [x] listar as transações filtrando por tipo: CREDIT ou DEBIT
  - [x] listar as transações independente do tipo
- [x] Visualizar um consolidado das transações de CREDIT e DEBIT
---

## :fax: Endpoint

> **POST /transactions**
  Registra as transações dos usuários

> **GET /transactions?type=**
  Lista as transações registradas 

> **GET /balance**
  Visualizar um consolidado das transações de CREDIT e DEBIT 

## :lock: Authentication

É utilizado autenticação JWT em todas as rotas e a PrivateKey é **ILIACHALLENGE** (passada por env var).
Para acessar as rotas utilize o Bearer token abaixo ou gere um em [jwt.io](https://jwt.io/) com o PrivateKey utilizada. 
<small>**eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mWfOMmo2CrcchOzCAiMTqkMvQCW3lX6o8wzikyYJjm4**</small>

> :warning: <small>A **PrivateKey** e o **Bearer token** são valores sigilosos, o projeto atual compartilha elas livremente por ser um exemplo.</small> 

## :rocket: Como executar o projeto

#### Primeiros Passos
Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com). 
<!-- Além disto é bom ter um editor para trabalhar com o código como [VSCode](https://code.visualstudio.com/) -->

```bash

# Clone este repositório
$ git clone https://github.com/JonasCastro/ilia-nodejs-challenge.git

# Acesse a pasta do projeto no terminal/cmd
$ cd ilia-nodejs-challenge/wallet


```

> Agora, na raiz do projeto _wallet_ crie o arquivo **.env** copiando o **.env.example**

> :warning: <small>O valor das variáveis em **.env.example** são sigilosas, o projeto atual compartilha elas livremente por ser um exemplo.</small> 

#### :rocket: Executar o servidor SEM docker
Antes de começar, é preciso ter instalado em sua máquina as seguintes ferramentas: [Node.js](https://nodejs.org/en/), [MongoDB](https://www.mongodb.com/).



> <small>É preciso ter uma base de dados **MongoDB** ou você pode executar **docker-compose up db** para criar o container do db do projeto :D.</small> 
```bash

# Estando no diretório wallet
# Instale as dependências
$ npm i

# Execute a aplicação em modo de desenvolvimento
$ npm run dev

# O servidor iniciará na porta:3001
```
> ⭐ <small>No seu navegador você pode acessar http://localhost:3001/docs/ para visualizar a documentação do projeto com swagger :D</small> 



#### :whale: Executar o servidor COM docker
Antes de começar é preciso ter instalado em sua máquina as seguintes ferramentas: [Docker Compose](https://docs.docker.com/compose/install/)

```bash

# Estando no diretório wallet
# Iniciar todos containers: db e server
$ docker-compose up

# Se preferir utilize -d para executar os containers em segundo plano
$ docker-compose up -d

# ou execute de forma individual 
$ docker-compose up -d db
$ docker-compose up -d wallet

# O servidor iniciará na porta:3001
```
> ⭐ <small>No seu navegador você pode acessar http://localhost:3001/docs/ para visualizar a documentação do projeto com swagger :D</small> 

#### 🧪  Testes

```bash

# Estando no diretório wallet

# Instale as dependências
$ npm i

# Para executar os testes
$ npm test

```

> ⭐ <small>Acesse o arquivo **.../wallet/coverage/lcov-report/index.html** no navegador para acompanhar o relatório de testes.:D</small> 

---

## :computer: Tecnologias

Principais ferramentas utilizadas na construção do projeto:

-   **[TypeScript](https://www.typescriptlang.org/)**
-   **[NodeJS](https://nodejs.org/en/)**
-   **[Express](https://expressjs.com/)**
-   **[Mongoose](https://mongoosejs.com/)**
-   **[MongoDB](https://www.mongodb.com/)**
-   **[Docker](https://www.docker.com/)**
-   **[JestJS](https://jestjs.io/)**
-   **[Swagger](https://swagger.io/)**
-   **[ts-node](https://github.com/TypeStrong/ts-node)**
-   **[Celebrate](https://github.com/arb/celebrate)**
-   **[ExpressAsyncErrors](https://www.npmjs.com/package/express-async-errors)**
-   **[Tsyringe](https://github.com/microsoft/tsyringe)**


> para mais informações acesse o arquivo  [package.json](https://github.com/JonasCastro/ilia-nodejs-challenge/blob/master/wallet/package.json)

**Utilitários**

-   Editor:  **[Visual Studio Code](https://code.visualstudio.com/)**  → Extensions:  **[ESlintJS](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)**, **[EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)**
-   Markdown:  **[Markdown Emoji](https://gist.github.com/rxaviers/7360908)**
-   README Template:  **[README-ecoleta](https://github.com/tgmarinho/README-ecoleta/blob/master/README.md)**


---


## Autor
Jonas Castro

[![Linkedin Badge](https://img.shields.io/badge/-Jonas-blue?style=flat-square&logo=Linkedin&logoColor=white&link=https://www.linkedin.com/in/jonas-castro-b4044111a/)](https://www.linkedin.com/in/jonas-castro-b4044111a/) 

---

## :memo: Licença
Este projeto esta sobe a licença [MIT](./LICENSE)


Feito com :heart: por Jonas Castro :wave: [Entre em contato!](https://www.linkedin.com/in/jonas-castro-b4044111a/)
