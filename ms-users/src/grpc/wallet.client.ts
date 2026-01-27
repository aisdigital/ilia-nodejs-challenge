import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as crypto from 'crypto';
import { env } from '../config/env';
import path from 'path';

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

export type TransactionType = 'CREDIT' | 'DEBIT';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}


export interface CreateInitialBalanceRequest {
  user_id: string;
  initial_amount: number;
}

export interface CreateInitialBalanceResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

export interface GetBalanceRequest {
  user_id: string;
}

export interface GetBalanceResponse {
  amount: number;
}

export interface GetTransactionsRequest {
  user_id: string;
  type?: TransactionType;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
}
interface WalletServiceClient {
  CreateInitialBalance: (
    request: CreateInitialBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: CreateInitialBalanceResponse) => void
  ) => void;

  GetBalance: (
    request: GetBalanceRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: GetBalanceResponse) => void
  ) => void;

  GetTransactions: (
    request: GetTransactionsRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: GetTransactionsResponse) => void
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
      const request: CreateInitialBalanceRequest = {
        user_id: userId,
        initial_amount: initialAmount,
      };

      this.client.CreateInitialBalance(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC CreateInitialBalance error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getBalance(userId: string): Promise<GetBalanceResponse> {
    return new Promise((resolve, reject) => {
      const request: GetBalanceRequest = {
        user_id: userId,
      };

      this.client.GetBalance(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC GetBalance error:', error);
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getTransactions(userId: string, type?: 'CREDIT' | 'DEBIT'): Promise<GetTransactionsResponse> {
    return new Promise((resolve, reject) => {
      const request: GetTransactionsRequest = {
        user_id: userId,
        type,
      };

      this.client.GetTransactions(request, this.metadata, (error, response) => {
        if (error) {
          console.error('gRPC GetTransactions error:', error);
          reject(error);
        } else {
          resolve(response);
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
