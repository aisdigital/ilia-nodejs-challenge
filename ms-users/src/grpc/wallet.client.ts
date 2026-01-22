import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { env } from '../config/env';
import path from 'path';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  created_at: string;
  updated_at: string;
}

interface CreateInitialBalanceRequest {
  user_id: string;
  initial_amount: number;
}

interface CreateInitialBalanceResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

interface GetBalanceRequest {
  user_id: string;
}

interface GetBalanceResponse {
  amount: number;
}

interface GetTransactionsRequest {
  user_id: string;
  type?: 'CREDIT' | 'DEBIT';
}

interface GetTransactionsResponse {
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
    this.metadata.add('authorization', `Bearer ${env.JWT_SECRET_INTERNAL}`);
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
