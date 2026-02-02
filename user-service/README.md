# User Microservice

User management microservice for ília Digital Challenge.

## Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

## Development

Start development server with hot-reload:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Build

Build TypeScript:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Database

Access Prisma Studio:
```bash
npm run prisma:studio
```

## API

- `GET /health` - Health check
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
