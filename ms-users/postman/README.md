# MS-Users Postman Collection

Collection to test the Users Microservice API endpoints.

## 🚀 Quick Start

1. **Import in Postman**:
   - `MS-Users.postman_collection.json`
   - `MS-Users.postman_environment.json`

2. **Select Environment**: "MS-Users - Development"

3. **Ensure service is running**:
   ```bash
   docker-compose up -d ms-users
   # or
   cd ms-users && npm run dev
   ```

4. **Start testing**:
   - Run **Register New User** first
   - JWT token will be automatically saved
   - Use token to access protected routes

## 📋 Available Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### Users (Requires JWT)
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 📖 Complete Documentation

For complete guide with troubleshooting, automated tests, and examples, see:

👉 **[POSTMAN.md](../../POSTMAN.md)** (project root)

## 🔗 Useful Links

- **API Docs**: http://localhost:3002/docs
- **Health Check**: http://localhost:3002/health
- **Base URL**: http://localhost:3002
