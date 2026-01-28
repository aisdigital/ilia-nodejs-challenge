# gRPC Server - MS-Wallet

gRPC server for internal communication between microservices.

## 🔐 Security

Authentication via JWT with separate secret: `JWT_SECRET_INTERNAL`

```typescript
// Client sends token in metadata
const metadata = new grpc.Metadata();
metadata.add('authorization', `Bearer ${JWT_TOKEN_INTERNAL}`);
```

## 📡 Port

**50051** (configurable via `GRPC_PORT`)

## 📂 Structure

```
ms-wallet/src/grpc/
├── wallet.server.ts      # gRPC server (manual code)
├── README.md             # This file
└── generated/            # ⚠️ Auto-generated (do not edit)
    ├── index.ts
    └── wallet.ts
```

> ⚠️ The `generated/` folder is copied from `proto/generated/` and is in `.gitignore`

## 🏗️ Code Generation

TypeScript types are auto-generated from `.proto` files using `buf` + `ts-proto`.

### Generate Types

```bash
# From project root
npm run proto:generate
```

This generates typed interfaces in `./generated/wallet.ts`:

- `CreateInitialBalanceRequest` / `CreateInitialBalanceResponse`
- `GetBalanceRequest` / `GetBalanceResponse`
- `GetTransactionsRequest` / `GetTransactionsResponse`
- `Transaction`
- `WalletServiceClient` (typed client)
- `WalletServiceServer` (server interface)

### Using Generated Types

```typescript
import {
  WalletServiceServer,
  CreateInitialBalanceRequest,
  CreateInitialBalanceResponse,
  GetBalanceRequest,
  GetBalanceResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
  Transaction,
} from './generated/wallet';
```

## 🔧 Available RPCs

### 1. CreateInitialBalance

Creates initial balance for a new user.

**Request:**

```typescript
{
  userId: string;
  initialAmount: number;
}
```

**Response:**

```typescript
{
  success: boolean;
  message: string;
  transaction: Transaction | undefined;
}
```

### 2. GetBalance

Queries user's current balance.

**Request:**

```typescript
{
  userId: string;
}
```

**Response:**

```typescript
{
  amount: number;
}
```

### 3. GetTransactions

Lists user transactions (with optional type filter).

**Request:**

```typescript
{
  userId: string;
  type?: 'CREDIT' | 'DEBIT';  // Optional
}
```

**Response:**

```typescript
{
  transactions: Array<{
    id: string;
    userId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

## ⚙️ Configuration

Required environment variables:

```env
GRPC_PORT=50051              # gRPC server port
JWT_SECRET_INTERNAL=your-key # JWT key for internal auth
```

## 🧪 Tests

```bash
npm test -- wallet.server
```

## 🔗 Related Links

- **gRPC Client**: `ms-users/src/grpc/wallet.client.ts`
- **Proto Definition**: `proto/wallet.proto`
- **Proto Documentation**: `proto/README.md`
