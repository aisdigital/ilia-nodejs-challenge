# MS-Users Postman Collection

Collection to test the Users Microservice API endpoints.

## 🚀 Quick Start

### 1. Import Files in Postman

- `MS-Users.postman_collection.json`
- `MS-Users.postman_environment.json`

### 2. Select Environment

Choose **"MS-Users - Development"** from the environment dropdown.

### 3. Start the Service

```bash
# Using Docker Compose
docker-compose up -d ms-users

# Or locally
cd ms-users && npm run dev
```

### 4. Run Your First Request

1. Execute **"Register New User"** - Creates a new user
2. JWT token is automatically saved to environment
3. `user_id` is also saved for subsequent requests

## ✨ Features

### Automatic Token Management

After registration or login, the collection automatically saves:

- `jwt_token` - For authenticated requests
- `user_id` - For user-specific operations
- `user_email` - For login tests

### Shared Authentication with MS-Wallet

The JWT token works across both microservices:

1. **MS-Users**: Register/Login to get token
2. **MS-Wallet**: Use same token for wallet operations

Both services share the same `jwt_token` and `user_id` environment variables.

## 📋 Available Endpoints

### Authentication (No Auth Required)

| Method | Endpoint         | Description                     |
| ------ | ---------------- | ------------------------------- |
| POST   | `/auth/register` | Register new user and get JWT   |
| POST   | `/auth/login`    | Login with existing credentials |

### Users (Requires JWT)

| Method | Endpoint     | Description                         |
| ------ | ------------ | ----------------------------------- |
| GET    | `/users`     | List all active users               |
| GET    | `/users/:id` | Get user by ID                      |
| PUT    | `/users/:id` | Update user (name, email, password) |
| DELETE | `/users/:id` | Soft delete user                    |

### Wallet Integration (Requires JWT)

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/users/:id/balance` | Get balance via gRPC from MS-Wallet |

### Health (No Auth Required)

| Method | Endpoint  | Description                   |
| ------ | --------- | ----------------------------- |
| GET    | `/health` | Service health status         |
| GET    | `/docs`   | Swagger/OpenAPI documentation |

## 📝 Environment Variables

| Variable     | Description                                   | Auto-Set |
| ------------ | --------------------------------------------- | -------- |
| `base_url`   | API base URL (default: http://localhost:3002) | No       |
| `jwt_token`  | JWT token for authenticated requests          | Yes      |
| `user_id`    | Current user ID                               | Yes      |
| `user_email` | Current user email (for login)                | Yes      |
| `test_email` | Auto-generated email for registration         | Yes      |

## 🧪 Test Scenarios

### Complete User Flow

1. **Register** - Create new user (auto-saves token)
2. **Get User** - Verify user was created
3. **Update Name** - Change user name
4. **Update Email** - Change email (updates `user_email` var)
5. **Get Balance** - Check wallet balance via gRPC
6. **Delete User** - Soft delete

### Error Handling Tests

- **Invalid Email**: Registration with bad email format
- **Short Password**: Password under 6 characters
- **Duplicate Email**: Register with existing email
- **Wrong Password**: Login with incorrect password
- **Unauthorized**: Access protected route without token
- **Not Found**: Get non-existent user

## 🔗 Using with MS-Wallet

After registering/logging in via MS-Users:

1. Import MS-Wallet collection from `../ms-wallet/postman/`
2. Import same environment (variables are shared)
3. Run wallet operations using the saved `jwt_token` and `user_id`

## 📖 Full Documentation

For complete guide including Docker setup and troubleshooting:

👉 **[POSTMAN.md](../../POSTMAN.md)** (project root)

## 🔗 Links

- **API Docs**: http://localhost:3002/docs
- **Health Check**: http://localhost:3002/health
- **Base URL**: http://localhost:3002
