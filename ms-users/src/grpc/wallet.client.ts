import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as crypto from 'crypto';
import { env } from '../config/env';
import path from 'path';
import type {
  CreateInitialBalanceResponse,
  GetBalanceResponse,
  GetTransactionsResponse,
  Transaction,
} from './generated/wallet';

// Re-export generated types for consumers
export type { 
  CreateInitialBalanceResponse,
  GetBalanceResponse, 
  GetTransactionsResponse,
  Transaction,
};

export type TransactionType = 'CREDIT' | 'DEBIT';

// Simple JWT creation for internal service communication
function createInternalToken(secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { 
    service: 'ms-users', 
    type: 'internal',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  };
  
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
  
  return `${base64Header}.${base64Payload}.${signature}`;
}

// Proto-loader runtime types (snake_case) - used internally for gRPC calls
// These map to the generated types which use camelCase
interface ProtoTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  created_at: string;
  updated_at: string;
}

interface ProtoCreateInitialBalanceRequest {
  user_id: string;
  initial_amount: number;
}

interface ProtoCreateInitialBalanceResponse {
  success: boolean;
  message: string;
  transaction?: ProtoTransaction;
}

interface ProtoGetBalanceRequest {
  user_id: string;
}

interface ProtoGetBalanceResponse {
  amount: number;
}

interface ProtoGetTransactionsRequest {
  user_id: string;
  type?: string;
}

interface ProtoGetTransactionsResponse {
  transactions: ProtoTransaction[];
}

// Conversion helpers: proto (snake_case) -> generated types (camelCase)
function convertTransaction(proto: ProtoTransaction): Transaction {
  return {
    id: proto.id,
    userId: proto.user_id,
    amount: proto.amount,
    type: proto.type,
    createdAt: proto.created_at,
    updatedAt: proto.updated_at,
  };
}

function convertCreateInitialBalanceResponse(proto: ProtoCreateInitialBalanceResponse): CreateInitialBalanceResponse {
  return {
    success: proto.success,
    message: proto.message,
    transaction: proto.transaction ? convertTransaction(proto.transaction) : undefined,
  };
}

function convertGetTransactionsResponse(proto: ProtoGetTransactionsResponse): GetTransactionsResponse {
  return {
    transactions: proto.transactions.map(convertTransaction),
  };
}

interface WalletServiceClient {
  CreateInitialBalance: (
    request: ProtoCreateInitialBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: ProtoCreateInitialBalanceResponse) => void
  ) => void;

  GetBalance: (
    request: ProtoGetBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: ProtoGetBalanceResponse) => void
  ) => void;

  GetTransactions: (
    request: ProtoGetTransactionsRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: ProtoGetTransactionsResponse) => void
  ) => void;
}

export class WalletGrpcClient {
  private client: WalletServiceClient;
  private metadata: grpc.Metadata;

  constructor() {
    const PROTO_PATH = path.resolve(__dirname, '../../../proto/wallet.proto');

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    const walletProto = protoDescriptor.wallet;

    const serverAddress = `${env.GRPC_WALLET_HOST}:${env.GRPC_WALLET_PORT}`;

    this.client = new walletProto.WalletService(
      serverAddress,
      grpc.credentials.createInsecure()
    ) as WalletServiceClient;

    this.metadata = new grpc.Metadata();
    const internalToken = createInternalToken(env.JWT_SECRET_INTERNAL);
    this.metadata.add('authorization', `Bearer ${internalToken}`);
  }

  async createInitialBalance(userId: string, initialAmount: number = 0): Promise<CreateInitialBalanceResponse> {
    return new Promise((resolve, reject) => {
      const request: ProtoCreateInitialBalanceRequest = {
        user_id: userId,
        initial_amount: initialAmount,
      };

      this.client.CreateInitialBalance(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC CreateInitialBalance error:', error);
          reject(error);
        } else {
          resolve(convertCreateInitialBalanceResponse(response));
        }
      });
    });
  }

  async getBalance(userId: string): Promise<GetBalanceResponse> {
    return new Promise((resolve, reject) => {
      const request: ProtoGetBalanceRequest = {
        user_id: userId,
      };

      this.client.GetBalance(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC GetBalance error:', error);
          reject(error);
        } else {
          resolve(response); // GetBalanceResponse is the same structure
        }
      });
    });
  }

  async getTransactions(userId: string, type?: 'CREDIT' | 'DEBIT'): Promise<GetTransactionsResponse> {
    return new Promise((resolve, reject) => {
      const request: ProtoGetTransactionsRequest = {
        user_id: userId,
        type,
      };

      this.client.GetTransactions(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC GetTransactions error:', error);
          reject(error);
        } else {
          resolve(convertGetTransactionsResponse(response));
        }
      });
    });
  }

  close(): void {
    grpc.closeClient(this.client as any);
  }
}

let clientInstance: WalletGrpcClient | null = null;

export const walletGrpcClient = {
  get instance(): WalletGrpcClient {
    if (!clientInstance) {
      clientInstance = new WalletGrpcClient();
    }
    return clientInstance;
  },
  createInitialBalance: (userId: string, initialAmount: number = 0) => {
    return walletGrpcClient.instance.createInitialBalance(userId, initialAmount);
  },
  getBalance: (userId: string) => {
    return walletGrpcClient.instance.getBalance(userId);
  },
  getTransactions: (userId: string, type?: 'CREDIT' | 'DEBIT') => {
    return walletGrpcClient.instance.getTransactions(userId, type);
  },
  close: () => {
    if (clientInstance) {
      clientInstance.close();
    }
  },
};
