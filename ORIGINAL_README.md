# ília - Code Challenge NodeJS
**English**
##### Before we start ⚠️
**Please create a fork from this repository**

## The Challenge:
One of the ília Digital verticals is Financial and to level your knowledge we will do a Basic Financial Application and for that we divided this Challenge in 2 Parts.

The first part is mandatory, which is to create a Wallet microservice to store the users' transactions, the second part is optional (*for Seniors, it's mandatory*) which is to create a Users Microservice with integration between the two microservices (Wallet and Users), using internal communications between them, that can be done in any of the following strategies: gRPC, REST, Kafka or via Messaging Queues and this communication must have a different security of the external application (JWT, SSL, ...), **Development in javascript (Node) is required.**

![diagram](diagram.png)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15 (optional, for local development without Docker)

### Setup Instructions

#### 1. Configure Environment Variables

Before running the application, you need to set up environment variables for each service:

**For Wallet Service:**
```bash
# Navigate to the wallet-service directory
cd wallet-service

# Copy the example environment file
cp .env.example .env

# Edit .env with your actual configuration (optional for local development)
# The .env.example file contains default values suitable for Docker
```

**Important:** 
- **Never commit `.env` files to git** - they contain sensitive information
- Always copy from `.env.example` to create your `.env` file
- The `.env` files are automatically ignored by git (see `.gitignore`)

#### 2. Run with Docker (Recommended)

```bash
# From the project root
docker-compose up -d

# This will start:
# - PostgreSQL database for wallet (port 5432)
# - Wallet microservice (port 3001)
# - PostgreSQL database for users (port 5433, future)
# - Users microservice (port 3002, future)
```

Access the wallet service:
```bash
curl http://localhost:3001/health
```

#### 3. Local Development (Without Docker)

```bash
# Navigate to wallet-service
cd wallet-service

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start PostgreSQL (ensure it's running locally)
# Then update DATABASE_URL in .env to point to your local database

# Start the development server
npm run dev

# In another terminal, run tests
npm test
```

### Available Commands

**In wallet-service directory:**
```bash
npm run dev              # Start development server with hot-reload
npm run build            # Build TypeScript to JavaScript
npm start                # Run production build
npm test                 # Run tests
npm test:watch           # Run tests in watch mode
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio UI
```

### Environment Variables Reference

See `wallet-service/.env.example` for all available environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://user:password@db:5432/walletdb |
| `JWT_SECRET` | JWT signing secret | ILIACHALLENGE |
| `NODE_ENV` | Environment (development/production) | development |

### Project Structure

```
aisdigital-challenge/
├── docker-compose.yml       # Main orchestration file
├── wallet-service/          # Wallet microservice
│   ├── src/                 # TypeScript source code
│   ├── tests/               # Jest tests
│   ├── prisma/              # Database schema
│   ├── .env.example         # Environment variables template
│   ├── .env                 # Actual environment (not committed)
│   └── README.md            # Service documentation
└── ...
```

### Security Notes

- **Never share `.env` files** - they contain sensitive credentials
- **Always use `.env.example`** as a template for new setups
- **Change JWT_SECRET in production** - do not use the default value
- **Rotate database credentials** in production environments

---

### General Instructions:
## Part 1 - Wallet Microservice

This microservice must be a digital Wallet where the user transactions will be stored 

### The Application must have

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.
    - Have a dedicated database (Postgres, MySQL, Mongo, DynamoDB, ...).
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Configure the Microservice port to 3001. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a team work and not just a commit.

## Part 2 - Microservice Users and Wallet Integration

### The Application must have:

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.   
    - Have a dedicated database(Postgres, MySQL, Mongo, DynamoDB...), you may use an Auth service like AWS Cognito.
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Set the Microservice port to 3002. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a teamwork and not just a commit.
    - Internal Communication Security (JWT, SSL, ...), if it is JWT the PrivateKey must be ILIACHALLENGE_INTERNAL (passed by env var).
    - Communication between Microservices using any of the following: gRPC, REST, Kafka or via Messaging Queues (update your readme with the instructions to run if using a Docker/Container environment).

#### In the end, send us your fork repo updated. As soon as you finish, please let us know.

#### We are available to answer any questions.


Happy coding! 🤓
