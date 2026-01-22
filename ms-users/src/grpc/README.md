# gRPC Client - MS-Users

gRPC client for internal communication with MS-Wallet.

## 🔐 Security

Authentication via internal JWT: `JWT_SECRET_INTERNAL`

## 🏗️ Architecture

```
MS-Users (Port 3002)
    ↓ gRPC Client
    ↓ JWT_SECRET_INTERNAL
    ↓
MS-Wallet gRPC Server (Port 50051)
    ↓ Process transactions
    ↓
MS-Wallet Database
```

## 📂 File

**`wallet.client.ts`** - gRPC client with 3 methods:

### 1. createInitialBalance

Creates initial balance when user registers.

```typescript
await walletGrpcClient.createInitialBalance(userId, 0);
```

### 2. getBalance

Queries user balance.

```typescript
const balance = await walletGrpcClient.getBalance(userId);
```

### 3. getTransactions

Lists transactions (with optional filter).

```typescript
const transactions = await walletGrpcClient.getTransactions(userId, 'CREDIT');
```

## 💡 Usage in AuthService

```typescript
import { walletGrpcClient } from '../grpc/wallet.client';

// When registering new user
try {
  await walletGrpcClient.createInitialBalance(user.id, 0);
  console.log(`Initial balance created for user ${user.id}`);
} catch (error) {
  console.error('Failed to create initial balance:', error);
}
```

## ⚙️ Configuration

Required environment variables:

```env
WALLET_GRPC_URL=ms-wallet:50051
JWT_SECRET_INTERNAL=ILIACHALLENGE_INTERNAL
```

## 🧪 Tests

See tests at: `__tests__/wallet.client.spec.ts`

```bash
npm test -- wallet.client.spec
```

## 🔗 Server

The gRPC server is in **MS-Wallet**: `ms-wallet/src/grpc/wallet.server.ts`
