# ília - NodeJS Challenge

Sistema de microserviços para gestão de carteira digital e usuários, desenvolvido conforme especificações do desafio **ília Digital**.

![diagram](diagram.png)

## 📋 Visão Geral

Este projeto implementa dois microserviços integrados seguindo **Clean Architecture**, **SOLID** e **DRY**:
- **MS-Wallet (Porta 3001)**: Gerenciamento de transações financeiras
- **MS-Users (Porta 3002)**: Gerenciamento de usuários e autenticação

### 🎯 Endpoints Principais
- **POST /transactions** - Criar transação (requer JWT)
- **GET /transactions** - Listar transações (requer JWT)  
- **GET /balance** - Consultar saldo (requer JWT)
- **POST /users** - Criar usuário (público)
- **POST /auth** - Login (público)
- **GET /users** - Listar usuários (requer JWT)

## 🏗️ Arquitetura

### Microserviços
- **ms-wallet** (porta 3001): Transações financeiras (CREDIT/DEBIT)
- **ms-users** (porta 3002): Usuários e autenticação com integração ao MS-Wallet
- **PostgreSQL**: Bancos dedicados (5433: wallet-db | 5434: users-db)
- **Comunicação Interna**: JWT interno com `ILIACHALLENGE_INTERNAL`

## 🚀 Tecnologias Utilizadas

- **Node.js** 18+
- **TypeScript**
- **Express.js**
- **PostgreSQL** 15
- **JWT** para autenticação
- **Docker & Docker Compose**
- **bcrypt** para hash de senhas
- **Joi** para validação de dados
- **axios** para comunicação entre serviços
- **Swagger** para documentação da API
- **nodemon** para desenvolvimento

## 📁 Estrutura do Projeto

```
├── ms-wallet/                 # Microserviço de Carteira
│   ├── src/
│   │   ├── domain/           # Entidades, casos de uso e interfaces
│   │   ├── infrastructure/   # Banco de dados, repositórios, middleware
│   │   └── presentation/     # Controllers e rotas
│   ├── Dockerfile
│   └── package.json
├── ms-users/                 # Microserviço de Usuários  
│   ├── src/
│   │   ├── domain/           # Entidades, casos de uso e interfaces
│   │   ├── infrastructure/   # Banco de dados, repositórios, serviços
│   │   └── presentation/     # Controllers e rotas
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Orquestração dos serviços
└── README.md
```

## 🛠️ Setup e Instalação

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Git

### 1. Clone o repositório

```bash
git clone <repository-url>
cd ilia-nodejs-challenge
```

### 2. Executar com Docker (Recomendado)

```bash
# Construir e executar todos os serviços
docker-compose up --build

# Executar em background
docker-compose up -d --build

# Parar os serviços
docker-compose down

# Remover volumes (dados do banco)
docker-compose down -v
```

## 🔗 Git Hooks (Qualidade de Código)

Este projeto utiliza **Husky** para automatizar verificações de qualidade:

### 📋 Hooks Configurados
- **Pre-commit**: ESLint + Prettier nos arquivos modificados  
- **Pre-push**: Lint + Build + Tests em todo o projeto

### 🚀 Setup dos Hooks
```bash
# Instalar dependências (inclui husky)
npm install

# Os hooks são ativados automaticamente após npm install
```

### 💡 Como Funciona
- **Commit**: Corrige automaticamente problemas de lint/formato
- **Push**: Bloqueia push se houver erros de build ou testes falhando

📖 **Documentação completa**: [GIT-HOOKS.md](./GIT-HOOKS.md)

### 3. Desenvolvimento Local

#### MS-Wallet:
```bash
cd ms-wallet
npm install
cp .env.example .env
npm run dev
```

#### MS-Users:
```bash
cd ms-users
npm install
cp .env.example .env
npm run dev
```

### 4. Variáveis de Ambiente

#### MS-Wallet (.env):
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=ILIACHALLENGE
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL  
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5433
DB_NAME=wallet_db
DB_USER=postgres
DB_PASSWORD=postgres
```

#### MS-Users (.env):
```env
NODE_ENV=development
PORT=3002
JWT_SECRET=ILIACHALLENGE
JWT_INTERNAL_SECRET=ILIACHALLENGE_INTERNAL
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5434
DB_NAME=users_db
DB_USER=postgres
DB_PASSWORD=postgres
WALLET_SERVICE_URL=http://localhost:3001
```

## 📚 API Documentation

### MS-Users (Porta 3002)

#### ✅ Endpoints Públicos
```bash
# Registrar usuário
POST /users
Content-Type: application/json

{
  "first_name": "João",
  "last_name": "Silva", 
  "email": "joao@email.com",
  "password": "123456"
}

# Fazer login
POST /auth
Content-Type: application/json

{
  "user": {
    "email": "joao@email.com",
    "password": "123456"
  }
}
```

#### 🔒 Endpoints Protegidos (Requer JWT)
```bash
# Listar todos os usuários
GET /users
Authorization: Bearer <token>

# Obter usuário por ID
GET /users/:id
Authorization: Bearer <token>

# Atualizar usuário
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "João",
  "last_name": "Santos"
}

# Deletar usuário
DELETE /users/:id
Authorization: Bearer <token>
```

### MS-Wallet (Porta 3001)

#### 🔒 Transações (Todas requerem JWT)
```bash
# Criar transação
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "user-uuid",
  "amount": 10000,
  "type": "CREDIT"
}

# Listar transações (com filtro opcional)
GET /transactions?type=CREDIT
Authorization: Bearer <token>

# Obter saldo consolidado
GET /balance
Authorization: Bearer <token>
```

### 📖 Documentação Interativa (Swagger UI)

Ambos os microserviços possuem documentação completa:

```bash
# MS-Users - Swagger UI
http://localhost:3002/api-docs

# MS-Wallet - Swagger UI
http://localhost:3001/api-docs
```

### 🔍 Health Checks e Observabilidade
```bash
# Health check simples
GET http://localhost:3002/health
GET http://localhost:3001/health

# Health check detalhado (inclui conectividade)
GET http://localhost:3002/health/detailed
GET http://localhost:3001/health/detailed
```

### 📊 Sistema de Logs
- **Correlation ID**: Rastreamento de requests com IDs únicos
- **Categorias**: request_entry, transaction, user_management, security
- **Formato Desenvolvimento**: Console colorido
- **Formato Produção**: JSON estruturado

## 🔐 Segurança e Autenticação

### JWT Tokens
- **JWT Externo**: `ILIACHALLENGE` - Para autenticação de usuários finais
- **JWT Interno**: `ILIACHALLENGE_INTERNAL` - Para comunicação entre microserviços  
- **Expiração**: 24 horas
- **Header**: `Authorization: Bearer <token>`

### Medidas de Segurança
- **Hash de Senhas**: bcrypt com salt rounds 10
- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Proteção de headers HTTP
- **CORS**: Configurado para desenvolvimento
- **Sanitização**: Remoção de dados sensíveis dos logs
- **Validação**: Joi schemas para todos os endpoints

## 🧪 Exemplo de Uso Completo

### 📋 Fluxo Completo via cURL:
```bash
# 1. Registrar usuário
curl -X POST http://localhost:3002/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"João","last_name":"Silva","email":"joao@test.com","password":"123456"}'

# 2. Fazer login e obter JWT token
curl -X POST http://localhost:3002/auth \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"joao@test.com","password":"123456"}}'

# 3. Criar transação CREDIT (usar token do login)
curl -X POST http://localhost:3001/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-uuid","amount":5000,"type":"CREDIT"}'

# 4. Verificar saldo consolidado
curl -X GET http://localhost:3001/balance \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 5. Listar transações com filtro
curl -X GET "http://localhost:3001/transactions?type=CREDIT" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 🎯 Testando via Swagger UI:
1. **MS-Users**: Acesse `http://localhost:3002/api-docs`
   - Registre um usuário via `POST /users`
   - Faça login via `POST /auth` e copie o token
   - Use "Authorize" para inserir: `Bearer <token>`
   - Teste endpoints protegidos: `GET /users`, `PATCH /users/{id}`

2. **MS-Wallet**: Acesse `http://localhost:3001/api-docs`  
   - Use "Authorize" com o token obtido no MS-Users
   - Crie transações via `POST /transactions`
   - Consulte saldo via `GET /balance`
   - Liste transações via `GET /transactions`

## 🐳 Docker

### 🚢 Portas e Serviços:
- **3001**: MS-Wallet (Transações)
- **3002**: MS-Users (Usuários)  
- **5433**: PostgreSQL Wallet DB
- **5434**: PostgreSQL Users DB

### 🔧 Configuração Docker:
- **wallet-db**: `postgres:15` na porta 5433
- **users-db**: `postgres:15` na porta 5434  
- **Volumes**: Persistência de dados separada por microserviço

### Volumes:
- `wallet_db_data`: Dados persistentes do banco da carteira
- `users_db_data`: Dados persistentes do banco de usuários

## 🔄 Comunicação Entre Microserviços

O MS-Users pode comunicar-se com o MS-Wallet através do `WalletService`, que:

- Usa JWT interno (`ILIACHALLENGE_INTERNAL`) para autenticação
- Implementa timeout e retry automático
- Mantém isolamento de responsabilidades

## 🏛️ Princípios Aplicados

### Clean Architecture:
- **Domain**: Entidades e casos de uso
- **Infrastructure**: Banco de dados, serviços externos  
- **Presentation**: Controllers e rotas

### SOLID:
- **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- **O**pen/Closed: Extensível via interfaces
- **L**iskov Substitution: Implementações substituíveis
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Depende de abstrações

### DRY:
- Middleware reutilizável
- Repositórios padronizados
- Configurações centralizadas

## 🧪 Testes

```bash
# MS-Wallet
cd ms-wallet
npm test

# MS-Users  
cd ms-users
npm test
```

## 📝 Logs e Monitoramento

- Health checks em `/health` para ambos os serviços
- Logs estruturados no console
- Tratamento centralizado de erros

## 🚀 Produção

Para deploy em produção:

1. Configure as variáveis de ambiente adequadas
2. Use HTTPS para comunicação externa
3. Configure proxy reverso (Nginx/Traefik)
4. Monitore logs e métricas
5. Configure backup dos bancos de dados

## ✅ Conformidade com Especificações

### URLs Implementadas Conforme YAML:
- ✅ **POST /transactions** - Criar transação
- ✅ **GET /transactions** - Listar transações (com filtro `?type=`)
- ✅ **GET /balance** - Consultar saldo  
- ✅ **POST /users** - Criar usuário
- ✅ **GET /users** - Listar usuários
- ✅ **GET /users/{id}** - Buscar usuário
- ✅ **PATCH /users/{id}** - Atualizar usuário
- ✅ **DELETE /users/{id}** - Deletar usuário
- ✅ **POST /auth** - Autenticação

### Configurações Conforme Challenge:
- ✅ **JWT Secret**: `ILIACHALLENGE` (externo) | `ILIACHALLENGE_INTERNAL` (interno)
- ✅ **Portas**: 3001 (wallet) | 3002 (users)
- ✅ **Bancos**: PostgreSQL separados nas portas 5433 e 5434
- ✅ **Schemas**: Conformes com ms-transactions.yaml e ms-users.yaml
- ✅ **Docker**: Containerização completa
- ✅ **Clean Architecture**: Domain, Infrastructure, Presentation
- ✅ **Logs**: Sistema estruturado com correlation ID de requests
- ✅ **Swagger**: Documentação interativa em /api-docs

### 🎯 Status Final:
- **Microserviços funcionais**: MS-Wallet e MS-Users ✅
- **Integração completa**: Comunicação interna segura ✅  
- **Conformidade total**: Especificações ília Digital ✅
- **Pronto para produção**: Docker, logs, health checks ✅

---

**ília Digital - NodeJS Challenge**  
Desenvolvido com ❤️ seguindo Clean Architecture e SOLID principles 🚀
