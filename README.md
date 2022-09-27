# ília - Code Challenge NodeJS


## Passos para execução do desafio:

Para a execução desse projeto, é necessario ter o docker instalado na máquina de execução, caso não o tenha, favor visitar https://docs.docker.com/engine/install para instalá-lo em seu sistema operacional.

Com o docker instalado, crie um arquivo .env conforme o .env-example localizado em ./transactions (para facilitar, as credenciais utilizadas nos arquivos docker são as mesmas do .env-example, então basta trocar o nome do mesmo para .env).

Após isto, na raiz do projeto, execute o comando:

    - docker-compose up

Isso irá buildar e executar tanto a base de dados quanto a aplicação (caso necessite alterar as credenciais do banco, favor olhar o arquivo docker-compose na raiz do projeto).

Com o banco e a aplicação rodando, abra outro terminal, navegue para as pastas ./transactions/src/database e execute o seguinte comando:

    - node migration.js up

Isso irá criar todas as tabelas necessárias no banco de dados e o sistema estará pronto para receber requisições.


### Endpoints:

Para facilitar as consultas, foi disponibilizado um postman_collection com todos os endpoints configurados.

## POST /user

No endpoint /user, o mesmo espera uma requisição POST com um objeto conforme a seguir no body:

    - {"firstName": "username",
    -   "lastName": "smith",
    -   "email": "teste@myrequest.com",
    -   "password": "teste123"
    - }

Onde o mesmo irá criar um usuário na base de dados, devido a ser um endpoint de cadastro, não é necessária autenticação nesta rota

## GET /user

No endpoint /user, o mesmo espera uma requisição GET com um JWT gerado a partir de um login válido. O token deve ser adicionado no header com a key ['x-acess-token'], e pode ser gerado através da rota /auth que está descrita no próximo item.

Onde o mesmo irá listar todos os usuários da base de dados, a fim de facilitar o manuseio das transações

## POST /auth

No endpoint /auth, o mesmo espera uma requisição POST com um objeto conforme a seguir no body:

    - {
    -   "email": "teste@myrequest.com",
    -   "password": "teste123"
    - }

Onde o mesmo irá verificar se o usuário é valido, e caso seja, irá retornar um token de autenticação para ser usado nas demais rotas. O token deve ser adicionado no header com a key ['x-acess-token'].

## POST /transaction

No endpoint /transaction, o mesmo espera uma requisição POST com um objeto conforme a seguir no body:

    - {"userId": 1,
    -   "type": "DEBIT",
    -   "amount": 100
    - }

E com o token de autenticação no headers com a key ['x-acess-token'].
Onde o mesmo irá verificar se o jwt é valido e criar uma transação do tipo CREDIT ou DEBIT.

## GET /transaction/:id

No endpoint /transaction, o mesmo espera uma requisição GET com o id do usuário no params da requisição

e com o token de autenticação no headers com a key ['x-acess-token'].

Onde o mesmo irá listar todas as transações do usuário com o ID informado.

## GET /balance/:id

No endpoint /balance, o mesmo espera uma requisição GET com o id do usuário no params da requisição

e com o token de autenticação no headers com a key ['x-acess-token'].

Onde o mesmo irá apresentar o saldo do usuário (onde pode ser negativo, caso ele tenha feito mais débitos que créditos).