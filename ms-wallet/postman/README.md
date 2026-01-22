# MS-Wallet Postman Collection

Collection to test the Wallet Microservice API endpoints.

## 🚀 Quick Start

1. **Import in Postman**:
   - `MS-Wallet.postman_collection.json`
   - `MS-Wallet.postman_environment.json`

2. **Select Environment**: "MS-Wallet - Development"

3. **Ensure service is running**:
   ```bash
   docker-compose up -d ms-wallet
   # or
   cd ms-wallet && npm run dev
   ```

4. **Get a JWT token**:
   - Run **MS-Users** requests first to obtain token
   - Or manually copy to the `token` environment variable

## 📋 Available Endpoints

### Transactions (Requires JWT)
- `POST /transactions` - Create transaction (CREDIT/DEBIT)
- `GET /transactions` - List all transactions
- `GET /transactions/balance/:userId` - Query balance
- `GET /transactions/type/:type` - Filter by type (CREDIT or DEBIT)
- `GET /transactions/:id` - Get transaction by ID
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### gRPC Server
- Port **50051** - Internal communication with MS-Users

## 📖 Complete Documentation

For complete guide with troubleshooting, automated tests, and examples, see:

👉 **[POSTMAN.md](../../POSTMAN.md)** (project root)

## 🔗 Useful Links

- **API Docs**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health
- **Base URL**: http://localhost:3001
- **gRPC Port**: 50051
