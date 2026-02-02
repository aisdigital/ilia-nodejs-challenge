# Wallet Microservice

The Wallet Microservice handles all transaction-related operations for the ília Digital Challenge.

## Project Structure

```
wallet-service/
├── src/                    # TypeScript source code
│   └── index.ts           # Main Express application
├── tests/                 # Test files
│   └── health.test.ts    # Health endpoint tests
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma data model
├── dist/                  # Compiled JavaScript (generated)
├── node_modules/          # Dependencies (generated)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest testing configuration
├── Dockerfile             # Docker container definition
└── .dockerignore          # Docker build ignore patterns
```

## Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL 15 (for development/production)

## Installation

```bash
npm install
```

## Available Scripts

### Development
```bash
npm run dev        # Start development server with hot-reload
npm run build      # Build TypeScript to JavaScript
```

### Testing
```bash
npm test           # Run tests once
npm test:watch     # Run tests in watch mode
```

### Production
```bash
npm start          # Start production server
npm run build      # Build TypeScript
```

### Database
```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio UI
```

## Environment Variables

### Setup Environment Variables

Before running the service, you must configure environment variables:

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values (optional for Docker)
# For local development, update DATABASE_URL to your PostgreSQL instance
```

### Required Variables

Create a `.env` file in the wallet-service root (use `.env.example` as template):

```env
PORT=3001
DATABASE_URL=postgresql://user:password@db:5432/walletdb
JWT_SECRET=ILIACHALLENGE
NODE_ENV=development
```

**Important Security Notes:**
- Never commit `.env` files to git - they contain secrets
- Always use `.env.example` to document required variables
- Change JWT_SECRET in production - do not use the default
- Use strong database passwords in production

See `.env.example` for additional configuration options and descriptions.

## Available Scripts

### Development
```bash
npm run dev        # Start development server with hot-reload
npm run build      # Build TypeScript to JavaScript
```

### Testing
```bash
npm test           # Run tests once
npm test:watch     # Run tests in watch mode
```

### Production
```bash
npm start          # Start production server
npm run build      # Build TypeScript
```

### Database
```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:studio     # Open Prisma Studio UI
```



### Health Check
- **GET** `/health` - Health check endpoint (no auth required)

### Transactions
- **GET** `/transactions` - Get all transactions (requires JWT)
- **POST** `/transactions` - Create a new transaction (requires JWT)

All transaction endpoints require JWT authentication via Bearer token.

## Docker

### Build
```bash
docker build -t wallet-service:latest .
```

### Run
```bash
docker run -e PORT=3001 \
  -e DATABASE_URL=postgresql://user:password@host/db \
  -e JWT_SECRET=ILIACHALLENGE \
  -p 3001:3001 \
  wallet-service:latest
```

## Docker Compose

Use the root `docker-compose.yml` to run the complete stack:

```bash
cd ..
docker-compose up
```

This will start:
- PostgreSQL database for wallet (port 5432)
- Wallet microservice (port 3001)
- PostgreSQL database for users (port 5433)
- Users microservice (port 3002)

## Testing

Run tests with coverage:

```bash
npm test -- --coverage
```

## Database

The wallet service uses PostgreSQL with Prisma ORM.

### Models
- **Transaction** - Stores individual transactions
- **Wallet** - Stores wallet information per user

### Migrations
Migrations are stored in `prisma/migrations/` and managed by Prisma.

## Development Workflow

1. Create a feature branch
2. Make changes in `src/`
3. Write/update tests in `tests/`
4. Run tests: `npm test`
5. Build: `npm run build`
6. Commit and push
7. Create a Pull Request

## Troubleshooting

### Port 3001 already in use
```bash
# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Database connection issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check user permissions

### Tests failing
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Run tests: `npm test`

## Security

- All endpoints except `/health` require JWT authentication
- JWT secret must be set via environment variable
- Private keys are never committed to git
- Use `.env` file (in .gitignore) for local development

## Performance Notes

- Uses Express 5.0 for native Promise support
- Prisma for efficient database queries
- TypeScript for type safety
- Multi-stage Docker build for optimized image size

## References

- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Jest Documentation](https://jestjs.io/)
- [OpenAPI Specification](../ms-transactions.yaml)

---

**Part of:** ília Digital Challenge - Wallet Microservice
**Status:** In Development
