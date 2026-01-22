# gRPC Server - MS-Wallet

gRPC server for internal communication between microservices.

## 🔐 Security

Authentication via JWT with separate secret: `JWT_SECRET_INTERNAL`

```javascript
const metadata = new grpc.Metadata();
metadata.add('authorization', `Bearer ${JWT_TOKEN_INTERNAL}`);
```

## 📡 Port

**50051** (configurable via `GRPC_PORT`)

## 🔧 Available RPCs

### 1. CreateInitialBalance

Creates initial balance for new user.

**Request:**
```typescript
{
  user_id: string;
  initial_amount: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  user_id: string;
  balance: number;
}
```

### 2. GetBalance

Queries user's current balance.

**Request:**
```typescript
{
  user_id: string;
}
```

**Response:**
```typescript
{
  user_id: string;
  balance: number;
}
```

### 3. GetTransactions

Lists user transactions (with optional type filter).

**Request:**
```typescript
{
  user_id: string;
  type?: 'CREDIT' | 'DEBIT';
}
```

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    user_id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    created_at: string;
  }>;
}
```

## 📂 Files

- **`wallet.server.ts`** - gRPC server implementation
- **`../../../proto/wallet.proto`** - Protocol definition (shared)

## 🧪 Testing

See tests at: `__tests__/wallet.client.spec.ts`

```bash
npm test -- wallet.client.spec
```

## 🔗 Client

The gRPC client is in **MS-Users**: `ms-users/src/grpc/wallet.client.ts`
