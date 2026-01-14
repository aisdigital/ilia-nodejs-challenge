# Wallet Microservice

Digital Wallet microservice for ília Digital Challenge - Part 1

## Technologies

- **Language**: TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (@fastify/jwt)
- **Containerization**: Docker & Docker Compose

## Requirements

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=wallet_user
DB_PASSWORD=wallet_pass
DB_NAME=wallet_db

# JWT Configuration
JWT_SECRET=ILIACHALLENGE
```

## Installation & Setup

### Using Docker (Recommended)

1. Navigate to wallet directory:
```bash
cd wallet
```

2. Start the services:
```bash
docker-compose up -d
```

3. View logs:
```bash
docker-compose logs -f wallet-app
```

4. Stop the services:
```bash
docker-compose down
```

### Local Development

1. Navigate to wallet directory:
```bash
cd wallet
```

2. Install dependencies:
```bash
npm install
```

3. Make sure PostgreSQL is running locally

4. Build TypeScript:
```bash
npm run build
```

5. Run the application:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
No authentication required. Returns service status.

### Wallet Routes
All wallet routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Example:
```
GET /api/wallet
```

## Testing Authentication

To test JWT authentication, you can generate a token using the secret `ILIACHALLENGE`:

```javascript
// Example: Generate token at https://jwt.io or using a script
{
  "userId": "123",
  "username": "testuser"
}
```

## Project Structure
ts       # Database configuration
│   ├── plugins/
│   │   └── jwt.ts            # JWT authentication plugin
│   └── server.ts             # Main application entry
├── dist/                     # Compiled TypeScript output
├── .env                      # Environment variables
├── .env.example              # Environment variables template
├── .dockerignore
├── .gitignore
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile
├── package.json
├── tsconfig.json             # TypeScript configuratile              # Environment variables template
├── .dockerignore
├── .gitignore
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile
├── package.json
└── README.md
```

## Next Steps

- [ ] Create Transaction model
- [ ] Implement transaction routes (create, read, list)
- [ ] Add balance calculation logic
- [ ] Add input validation
- [ ] Implement error handling
- [ ] Add tests

## Port Configuration

This microservice runs on port **3001** as required by the challenge.

## Database

PostgreSQL database is configured with:
- Database: `wallet_db`
- User: `wallet_user`
- Port: `5432` (mapped to host)

The database is automatically created when starting Docker Compose.
