import * as grpc from '@grpc/grpc-js';

export const protobufPackage = 'wallet';

export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInitialBalanceRequest {
  userId: string;
  initialAmount: number;
}

export interface CreateInitialBalanceResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

export interface GetBalanceRequest {
  userId: string;
}

export interface GetBalanceResponse {
  amount: number;
}

export interface GetTransactionsRequest {
  userId: string;
  type?: string;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}

export const fieldMappings = {
  userId: 'user_id',
  initialAmount: 'initial_amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
} as const;

/** Wallet service for internal communication between microservices */
export interface WalletServiceClient extends grpc.Client {
  createInitialBalance(
    request: CreateInitialBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: CreateInitialBalanceResponse) => void
  ): grpc.ClientUnaryCall;

  createInitialBalance(
    request: CreateInitialBalanceRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: CreateInitialBalanceResponse) => void
  ): grpc.ClientUnaryCall;

  getBalance(
    request: GetBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: GetBalanceResponse) => void
  ): grpc.ClientUnaryCall;

  getBalance(
    request: GetBalanceRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: GetBalanceResponse) => void
  ): grpc.ClientUnaryCall;

  getTransactions(
    request: GetTransactionsRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: GetTransactionsResponse) => void
  ): grpc.ClientUnaryCall;

  getTransactions(
    request: GetTransactionsRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: GetTransactionsResponse) => void
  ): grpc.ClientUnaryCall;
}

export interface WalletServiceServer extends grpc.UntypedServiceImplementation {
  createInitialBalance: grpc.handleUnaryCall<CreateInitialBalanceRequest, CreateInitialBalanceResponse>;
  
  getBalance: grpc.handleUnaryCall<GetBalanceRequest, GetBalanceResponse>;
  
  getTransactions: grpc.handleUnaryCall<GetTransactionsRequest, GetTransactionsResponse>;
}

export function fromProtoTransaction(proto: any): Transaction {
  return {
    id: proto.id,
    userId: proto.user_id,
    amount: Number(proto.amount),
    type: proto.type,
    createdAt: proto.created_at,
    updatedAt: proto.updated_at,
  };
}

export function toProtoTransaction(tx: Transaction): any {
  return {
    id: tx.id,
    user_id: tx.userId,
    amount: tx.amount,
    type: tx.type,
    created_at: tx.createdAt,
    updated_at: tx.updatedAt,
  };
}

export function fromProtoRequest<T extends object>(proto: any): T {
  const result: any = {};
  for (const [key, value] of Object.entries(proto)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

export function toProtoResponse<T extends object>(response: T): any {
  const result: any = {};
  for (const [key, value] of Object.entries(response)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}
