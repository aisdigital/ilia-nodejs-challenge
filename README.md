# Financial Microservices

Financial system with microservices architecture using Node.js 22, TypeScript, Fastify, PostgreSQL, and gRPC.

![Architecture](diagram.png)

## 🏗️ Architecture

- **MS-Wallet** (port 3001) - Transaction and balance management
- **MS-Users** (port 3002) - Authentication and user management
- **Internal Communication** - gRPC with JWT authentication (port 50051)
- **Database** - PostgreSQL 15 Alpine (dedicated per service)

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ilia-nodejs-challenge
```

### 2. Configure Environment Variables (Optional)

Create a `.env` file in the project root:

```env
NODE_ENV=development  # or production
```

**Note:** If you don't create `.env`, the system defaults to `production`.

### 3. Start Services with Docker

```bash
# Start all services (build + start)
docker-compose up --build

# Or in background
docker-compose up --build -d

# View logs
docker-compose logs -f ms-wallet
docker-compose logs -f ms-users
```

### 4. Access the Applications

- **MS-Wallet API**: http://localhost:3001
- **MS-Wallet Docs**: http://localhost:3001/docs
- **MS-Users API**: http://localhost:3002
- **MS-Users Docs**: http://localhost:3002/docs

### 5. Health Checks

```bash
# MS-Wallet
curl http://localhost:3001/health

# MS-Users
curl http://localhost:3002/health
```

## 🛠️ Local Development (Without Docker)

### MS-Wallet

```bash
cd ms-wallet

# Install dependencies
npm install

# Configure .env (copy from .env.example if available)
# Adjust DB_HOST=localhost, DB_PORT=5434

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

### MS-Users

```bash
cd ms-users

# Install dependencies
npm install

# Configure .env
# Adjust DB_HOST=localhost, DB_PORT=5433

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

**Note:** For local development, start only the databases:

```bash
docker-compose up -d db-wallet db-users
```

## 📦 Available Scripts

Each microservice has the following scripts:

```bash
npm run dev        # Development with hot-reload
npm run build      # Compile TypeScript
npm start          # Production (requires build first)
npm test           # Run tests
npm run test:watch # Tests in watch mode
```

## 🔐 Authentication

### External Authentication (REST API)

All protected routes require JWT in the header:

```bash
Authorization: Bearer <token>
```

**Secret Key:** `ILIACHALLENGE` (configurable via `JWT_SECRET`)

### Internal Authentication (gRPC)

Communication between microservices uses separate JWT:

**Secret Key:** `ILIACHALLENGE_INTERNAL` (configurable via `JWT_SECRET_INTERNAL`)

## 🧪 Testing with Postman

Import the collections from each `postman/` folder:

1. **MS-Wallet**: `ms-wallet/postman/MS-Wallet.postman_collection.json`
2. **MS-Users**: `ms-users/postman/MS-Users.postman_collection.json`

Also import the corresponding environments.

## 📊 Monitoring

System implemented with Pino (structured logging) and health checks.

See complete documentation at: [MONITORING.md](./MONITORING.md)

### Health Endpoints

Each service has:

- `GET /health` - Complete status (database, memory, gRPC)
- `GET /ready` - Readiness probe (Kubernetes)
- `GET /live` - Liveness probe (Kubernetes)

### Request Correlation

All requests generate an `x-request-id` for distributed tracing:

```bash
curl -H "x-request-id: my-trace-123" http://localhost:3001/health
```

## 🐳 Useful Docker Commands

```bash
# Stop all services
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v

# View status
docker-compose ps

# Real-time logs
docker-compose logs -f

# Rebuild only one service
docker-compose up --build ms-wallet

# Execute command inside container
docker exec -it ms-wallet sh
```

## 📁 Project Structure

```
ilia-nodejs-challenge/
├── ms-wallet/              # Wallet Microservice
│   ├── src/
│   │   ├── modules/transactions/
│   │   ├── grpc/          # gRPC Server
│   │   ├── shared/        # Plugins, utils, middlewares
│   │   └── config/
│   ├── postman/           # Postman Collections
│   └── Dockerfile
├── ms-users/              # Users Microservice
│   ├── src/
│   │   ├── modules/auth/
│   │   ├── modules/users/
│   │   ├── grpc/          # gRPC Client
│   │   ├── shared/
│   │   └── config/
│   ├── postman/
│   └── Dockerfile
├── proto/                 # Shared gRPC definitions
├── docker-compose.yml     # Services orchestration
└── MONITORING.md         # Monitoring guide
```

## 🧩 Technologies

- **Runtime**: Node.js 22 Alpine
- **Language**: TypeScript 5
- **Framework**: Fastify 5
- **ORM**: Sequelize 6
- **Database**: PostgreSQL 15
- **Communication**: gRPC (@grpc/grpc-js)
- **Authentication**: @fastify/jwt
- **Documentation**: OpenAPI 3.1 (@fastify/swagger)
- **Logging**: Pino (native Fastify)
- **Testing**: Jest 30
- **Containerization**: Docker & Docker Compose

## 📝 Environment Variables

### MS-Wallet

```env
NODE_ENV=production
PORT=3001
DB_HOST=db-wallet
DB_PORT=5432
DB_NAME=wallet_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=ILIACHALLENGE
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
GRPC_PORT=50051
```

### MS-Users

```env
NODE_ENV=production
PORT=3002
DB_HOST=db-users
DB_PORT=5432
DB_NAME=users_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=ILIACHALLENGE
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
WALLET_GRPC_URL=ms-wallet:50051
```

## 🔍 Troubleshooting

### Database connection error

```bash
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart db-wallet db-users
```

### Port already in use

```bash
# Find process using the port
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Change port in docker-compose.yml or kill the process
```

### gRPC not connecting

```bash
# Check if ms-wallet is running
docker-compose logs ms-wallet | grep "gRPC"

# Check port 50051
docker-compose ps | grep 50051
```
