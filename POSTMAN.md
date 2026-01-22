# 🧪 Testing with Postman

Quick guide to test the microservices APIs using Postman.

## 📦 Available Collections

### MS-Wallet Collection
- **File**: `ms-wallet/postman/MS-Wallet.postman_collection.json`
- **Environment**: `ms-wallet/postman/MS-Wallet.postman_environment.json`
- **Port**: 3001

### MS-Users Collection
- **File**: `ms-users/postman/MS-Users.postman_collection.json`
- **Environment**: `ms-users/postman/MS-Users.postman_environment.json`
- **Port**: 3002

## 🚀 Initial Setup

### 1. Import Collections

In Postman:
1. **File** → **Import**
2. Select the `.postman_collection.json` files
3. Select the `.postman_environment.json` files

### 2. Select Environment

- For MS-Wallet: select **"MS-Wallet - Development"**
- For MS-Users: select **"MS-Users - Development"**

### 3. Ensure Services Are Running

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# Health checks
curl http://localhost:3001/health
curl http://localhost:3002/health
```

## 🔐 Authentication Flow

### MS-Users - Registration and Login

1. **Register New User**
   - Creates a new user
   - Automatically saves JWT token in environment
   - Token is valid for 24h

2. **Login with Valid Credentials**
   - Login with email/password
   - Updates JWT token in environment

### MS-Wallet - Authentication

MS-Wallet requires:
- JWT token from MS-Users (external authentication)
- OR internal JWT token (for gRPC)

**Note:** Collections are already configured to use the automatically saved token in environment variables.

## 📋 Recommended Execution Order

### 1️⃣ First: MS-Users

```
1. Register New User          → Creates user and obtains JWT
2. Get All Users             → Lists users (requires JWT)
3. Get User by ID            → Fetches specific user
4. Update User               → Updates user data
```

### 2️⃣ Then: MS-Wallet

```
1. Create Transaction        → Creates transaction (CREDIT/DEBIT)
2. Get Balance              → Queries user balance
3. Get All Transactions     → Lists all transactions
4. Get Transactions by Type → Filters by CREDIT or DEBIT
```

## 🔑 Environment Variables

Collections use automatic variables:

### MS-Users Environment
```json
{
  "baseUrl": "http://localhost:3002",
  "token": "<auto-populated>",
  "userId": "<auto-populated>"
}
```

### MS-Wallet Environment
```json
{
  "baseUrl": "http://localhost:3001",
  "token": "<from-ms-users>",
  "transactionId": "<auto-populated>"
}
```

## 💡 Automated Tests

Both collections include **automated tests** in each request:

- ✅ Status code validation
- ✅ Response structure validation
- ✅ Automatic extraction of tokens and IDs
- ✅ Error scenario tests

### View Test Results

After executing a request:
1. Click on the **Test Results** tab
2. See which tests passed (✓) or failed (✗)

## 🎯 Included Test Scenarios

### MS-Users - Error Scenarios

- ✗ Register with Invalid Email
- ✗ Register with Short Password (< 6 characters)
- ✗ Register with Duplicate Email
- ✗ Login with Wrong Password
- ✗ Login with Non-existent Email
- ✗ Access Protected Route without Token

### MS-Wallet - Error Scenarios

- ✗ Create Transaction without JWT
- ✗ Create Transaction with Invalid Type
- ✗ Create Transaction with Negative Amount
- ✗ Get Balance for Non-existent User

## 🔄 Running Complete Collection

To run all tests at once:

1. **Collection Runner**:
   - Right-click on the collection
   - **Run collection**
   - Select the correct environment
   - Click **Run MS-Users** or **Run MS-Wallet**

2. **Via Newman (CLI)**:

```bash
# Install Newman
npm install -g newman

# Run MS-Users
newman run ms-users/postman/MS-Users.postman_collection.json \
  -e ms-users/postman/MS-Users.postman_environment.json

# Run MS-Wallet
newman run ms-wallet/postman/MS-Wallet.postman_collection.json \
  -e ms-wallet/postman/MS-Wallet.postman_environment.json
```

## 🛠️ Troubleshooting

### Expired Token

If you receive 401 Unauthorized error:
1. Run **Register New User** or **Login** again
2. Token will be automatically updated

### Incorrect Port

Verify that the ports in the environment match `docker-compose.yml`:
- MS-Users: `3002`
- MS-Wallet: `3001`

### Service Not Responding

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs ms-users
docker-compose logs ms-wallet

# Restart
docker-compose restart
```

## 📖 API Documentation

In addition to Postman, you can access the OpenAPI 3.1 documentation:

- **MS-Wallet Docs**: http://localhost:3001/docs
- **MS-Users Docs**: http://localhost:3002/docs

## 🎓 Request Examples

### Create User (MS-Users)

```bash
POST http://localhost:3002/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Transaction (MS-Wallet)

```bash
POST http://localhost:3001/transactions
Content-Type: application/json
Authorization: Bearer <token>

{
  "user_id": "user-uuid",
  "type": "CREDIT",
  "amount": 100.50,
  "description": "Initial deposit"
}
```

### Query Balance (MS-Wallet)

```bash
GET http://localhost:3001/transactions/balance/{userId}
Authorization: Bearer <token>
```

## ✨ Tips

1. **Use variables**: Collections automatically save tokens and IDs
2. **Order matters**: Run Register/Login before other requests
3. **Check tests**: Test Results tab shows automatic validations
4. **Newman**: Use for CI/CD pipelines
5. **Documentation**: Check `/docs` to see all available endpoints
