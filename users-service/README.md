# Users Service

Microservice for user management with JWT authentication and integration with the Wallet Service.

## Requirements

- Node.js 22+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
NODE_ENV=production
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=users_db
DB_USER=admin
DB_PASSWORD=admin123
JWT_SECRET=ILIACHALLENGE
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
PRIVATE_KEY=ILIACHALLENGE
PRIVATE_KEY_INTERNAL=ILIACHALLENGE_INTERNAL
WALLET_SERVICE_URL=http://wallet-service:3001/api
```

### Installation

```bash
npm install
```

### Run Migrations

Migrations are executed automatically when starting the service.

### Run Locally

```bash
npm start
```

The service will be available at `http://localhost:3002`

## Docker

### Build Image

```bash
docker build -t users-service .
```

### Run with Docker Compose

```bash
docker-compose up users-service
```

## Endpoints

### Authentication

#### POST /api/auth
Authenticates a user and returns a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com"
  },
  "access_token": "jwt_token"
}
```

### Users

#### POST /api/users
Creates a new user. No authentication required (public registration).

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com"
}
```

#### GET /api/users
Lists all users. Requires JWT authentication.

**Response:**
```json
[
  {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com"
  }
]
```

#### GET /api/users/:id
Gets a user by ID. Requires JWT authentication.

**Response:**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com"
}
```

#### PATCH /api/users/:id
Updates a user. Requires JWT authentication.

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "id": "uuid",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com"
}
```

#### DELETE /api/users/:id
Deletes a user. Requires JWT authentication.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Transactions

#### POST /api/transactions
Creates a new transaction. Requires external JWT authentication.

**Request:**
```json
{
  "amount": 100,
  "type": "credit",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "CREDIT",
  "amount": 100
}
```

#### GET /api/transactions?type=credit|debit
Lists user transactions. Requires external JWT authentication.

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "CREDIT",
    "amount": 100
  }
]
```

#### GET /api/balance
Returns the user's consolidated balance. Requires external JWT authentication.

**Response:**
```json
{
  "amount": 500
}
```

## Integration with Wallet Service

The Users Service communicates internally with the Wallet Service using internal JWT (`JWT_SECRET_INTERNAL`). When a new user is created, a wallet is automatically created for them through an internal call to the Wallet Service.

Transaction endpoints in the Users Service act as a proxy, forwarding requests to the Wallet Service using internal JWT tokens.

## Security

- All routes (except `/api/auth` and `/api/users` POST) require JWT authentication
- Passwords are hashed using bcrypt
- Internal communication between services uses a different JWT key (`JWT_SECRET_INTERNAL`)
- Input validation on all endpoints
- External routes use `PRIVATE_KEY` (ILIACHALLENGE)
- Internal routes use `PRIVATE_KEY_INTERNAL` (ILIACHALLENGE_INTERNAL)

## Project Structure

```
users-service/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/      # HTTP controllers
│   ├── middleware/       # Middlewares (auth, validators)
│   ├── migrations/       # Database migrations
│   ├── models/           # Sequelize models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   └── utils/            # Utilities
├── Dockerfile
├── package.json
└── README.md
```
