# gRPC Client - MS-Users

gRPC client for internal communication with MS-Wallet.

## 🔐 Security

Authentication via internal JWT: `JWT_SECRET_INTERNAL`

## 🏗️ Architecture

```
MS-Users (Port 3002)
    ↓ gRPC Client (wallet.client.ts)
    ↓ JWT_SECRET_INTERNAL
    ↓
MS-Wallet gRPC Server (Port 50051)
    ↓ Process transactions
    ↓
MS-Wallet Database
```

## 📂 Structure

```
ms-users/src/grpc/
├── wallet.client.ts      # gRPC client (manual code)
├── README.md             # This file
├── generated/            # ⚠️ Auto-generated (do not edit)
│   ├── index.ts
│   └── wallet.ts
└── __tests__/
    └── wallet.client.spec.ts
```

> ⚠️ The `generated/` folder is copied from `proto/generated/` and is in `.gitignore`

## 📦 Imported Types

```typescript
import {
  WalletServiceClient,
  CreateInitialBalanceRequest,
  CreateInitialBalanceResponse,
  GetBalanceRequest,
  GetBalanceResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  Transaction,
} from './generated/wallet';
```

## 🔧 Available Methods

### 1. createInitialBalance

Creates initial balance when a user registers.

```typescript
await walletGrpcClient.createInitialBalance(userId, 0);
```

### 2. getBalance

Queries user balance.

```typescript
const balance = await walletGrpcClient.getBalance(userId);
// Returns: number
```

### 3. getTransactions

Lists user transactions (with optional filter).

```typescript
// All transactions
const transactions = await walletGrpcClient.getTransactions(userId);

// Credits only
const credits = await walletGrpcClient.getTransactions(userId, 'CREDIT');

// Debits only
const debits = await walletGrpcClient.getTransactions(userId, 'DEBIT');
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
WALLET_GRPC_URL=ms-wallet:50051    # gRPC server URL
JWT_SECRET_INTERNAL=your-key       # JWT key for internal auth
```

## 🧪 Tests

```bash
npm test -- wallet.client.spec
```

See tests at: `__tests__/wallet.client.spec.ts`

## 🔗 Related Links

- **gRPC Server**: `ms-wallet/src/grpc/wallet.server.ts`
- **Proto Definition**: `proto/wallet.proto`
- **Proto Documentation**: `proto/README.md`
