# Proto Code Generation

This project uses [buf.build](https://buf.build/) + [ts-proto](https://github.com/stephenh/ts-proto) to generate TypeScript types from `.proto` files.

## 📁 Structure

```
proto/
├── wallet.proto          # gRPC protocol definition
├── buf.yaml              # buf configuration (lint, breaking)
├── buf.gen.yaml          # Code generation configuration
├── README.md             # This file
└── generated/            # ⭐ Single source of truth for generated types
    ├── index.ts          # Exports all types
    └── wallet.ts         # Types and gRPC client/server

scripts/
└── copy-proto.js         # Copies generated types to microservices

ms-users/src/grpc/generated/  # Copy (in .gitignore)
ms-wallet/src/grpc/generated/ # Copy (in .gitignore)
```

## 🛠️ Commands

### Generate TypeScript Types

```bash
# From project root
npm run proto:generate
```

This executes:

1. `buf generate` - generates types in `proto/generated/`
2. Automatically copies to `ms-users/src/grpc/generated/`
3. Automatically copies to `ms-wallet/src/grpc/generated/`

### Lint .proto Files

```bash
npm run proto:lint
```

### Check for Breaking Changes

```bash
npm run proto:breaking
```

## ✅ Cross-Platform

**buf** works natively on:

- ✅ Windows (PowerShell, CMD, Git Bash)
- ✅ macOS
- ✅ Linux

No manual `protoc` installation required - the `@bufbuild/buf` package automatically downloads the correct binary.

## 📦 Generated Types

The generated `wallet.ts` file contains:

### Message Interfaces

```typescript
// Request/Response for creating initial balance
interface CreateInitialBalanceRequest {
  userId: string;
  initialAmount: number;
}

interface CreateInitialBalanceResponse {
  success: boolean;
  message: string;
  transaction: Transaction | undefined;
}

// Request/Response for querying balance
interface GetBalanceRequest {
  userId: string;
}

interface GetBalanceResponse {
  amount: number;
}

// Request/Response for listing transactions
interface GetTransactionsRequest {
  userId: string;
  type?: string | undefined; // "CREDIT" or "DEBIT"
}

interface GetTransactionsResponse {
  transactions: Transaction[];
}

// Transaction model
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}
```

### gRPC Service Types

```typescript
import { handleUnaryCall, Client, ClientUnaryCall } from '@grpc/grpc-js';

// Server interface (implemented in ms-wallet)
interface WalletServiceServer {
  createInitialBalance: handleUnaryCall<
    CreateInitialBalanceRequest,
    CreateInitialBalanceResponse
  >;
  getBalance: handleUnaryCall<GetBalanceRequest, GetBalanceResponse>;
  getTransactions: handleUnaryCall<
    GetTransactionsRequest,
    GetTransactionsResponse
  >;
}

// Typed client (used in ms-users)
interface WalletServiceClient extends Client {
  createInitialBalance(request, metadata?, callback): ClientUnaryCall;
  getBalance(request, metadata?, callback): ClientUnaryCall;
  getTransactions(request, metadata?, callback): ClientUnaryCall;
}
```

## 🔧 Usage

### In gRPC Server (ms-wallet)

```typescript
import {
  WalletServiceServer,
  CreateInitialBalanceRequest,
  CreateInitialBalanceResponse,
} from './generated/wallet';

const walletService: WalletServiceServer = {
  createInitialBalance: (call, callback) => {
    const { userId, initialAmount } = call.request;
    // ... implementação
    callback(null, { success: true, message: 'OK', transaction });
  },
  getBalance: (call, callback) => {
    // ... implementação
  },
  getTransactions: (call, callback) => {
    // ... implementação
  },
};
```

### In gRPC Client (ms-users)

```typescript
import {
  WalletServiceClient,
  GetBalanceRequest,
  GetBalanceResponse,
} from './generated/wallet';

const client = new WalletServiceClient(
  'ms-wallet:50051',
  grpc.credentials.createInsecure(),
);

const request: GetBalanceRequest = { userId: 'user-123' };
client.getBalance(request, (error, response: GetBalanceResponse) => {
  console.log('Balance:', response.amount);
});
```

## ⚠️ Important Notes

1. **Do not edit files in `generated/`** - They are overwritten on each regeneration
2. **snake_case → camelCase** - ts-proto converts automatically (`user_id` → `userId`)
3. **Copies in .gitignore** - The `ms-*/src/grpc/generated/` folders are not committed
4. **Single source** - The `proto/generated/` folder is the source of truth

## 🔄 Workflow for Updating Proto

1. Edit `proto/wallet.proto`
2. Run `npm run proto:generate` from root
3. Update implementations in `ms-wallet` and `ms-users` as needed
4. Run tests to ensure compatibility

## 📚 Dependencies

```json
{
  "dependencies": {
    "@bufbuild/protobuf": "^2.11.0",
    "@grpc/grpc-js": "^1.14.3"
  },
  "devDependencies": {
    "@bufbuild/buf": "^1.64.0",
    "@bufbuild/protoc-gen-es": "^2.11.0",
    "ts-proto": "^2.11.1"
  }
}
```
