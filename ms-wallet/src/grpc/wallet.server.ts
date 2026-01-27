import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TransactionService } from '../modules/transactions/transaction.service';
import { TransactionRepository } from '../modules/transactions/transaction.repository';
import { TransactionType } from '../modules/transactions/transaction.model';

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

// Initialize service
const transactionRepository = new TransactionRepository();
const transactionService = new TransactionService(transactionRepository);

function verifyInternalToken(metadata: grpc.Metadata): void {
  const authHeader = metadata.get('authorization')[0] as string;
  
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    jwt.verify(token, env.JWT_SECRET_INTERNAL);
  } catch (error) {
    throw new Error('Invalid internal authentication token');
  }
}

async function createInitialBalance(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
): Promise<void> {
  try {
    verifyInternalToken(call.metadata);

    const { user_id, initial_amount } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'user_id is required',
      });
    }

    const amount = initial_amount || 0;

    let transaction = null;
    
    if (amount > 0) {
      transaction = await transactionService.create({
        user_id,
        amount,
        type: TransactionType.CREDIT,
      });
    }

    callback(null, {
      success: true,
      message: amount > 0 
        ? `Initial balance of ${amount} created for user ${user_id}`
        : `Wallet initialized for user ${user_id} with zero balance`,
      transaction: transaction ? {
        id: transaction.id,
        user_id: transaction.user_id,
        amount: transaction.amount,
        type: transaction.type,
        created_at: transaction.created_at.toISOString(),
        updated_at: transaction.updated_at.toISOString(),
      } : null,
    });
  } catch (error: any) {
    console.error('gRPC CreateInitialBalance error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message || 'Failed to create initial balance',
    });
  }
}

async function getBalance(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
): Promise<void> {
  try {
    verifyInternalToken(call.metadata);

    const { user_id } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'user_id is required',
      });
    }

    const balanceResponse = await transactionService.getBalance(user_id);

    callback(null, { amount: balanceResponse.amount });
  } catch (error: any) {
    console.error('gRPC GetBalance error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message || 'Failed to get balance',
    });
  }
}

async function getTransactions(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>
): Promise<void> {
  try {
    verifyInternalToken(call.metadata);

    const { user_id, type } = call.request;

    if (!user_id) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'user_id is required',
      });
    }

    const transactions = await transactionService.list(user_id, type || undefined);

    callback(null, {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        user_id: tx.user_id,
        amount: tx.amount,
        type: tx.type,
        created_at: tx.created_at.toISOString(),
        updated_at: tx.updated_at.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('gRPC GetTransactions error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message || 'Failed to get transactions',
    });
  }
}

export function startGrpcServer(): grpc.Server {
  const server = new grpc.Server();

  server.addService(walletProto.WalletService.service, {
    CreateInitialBalance: createInitialBalance,
    GetBalance: getBalance,
    GetTransactions: getTransactions,
  });

  const address = `0.0.0.0:${env.GRPC_PORT}`;
  
  server.bindAsync(
    address,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        throw error;
      }
      console.log(`gRPC Server running on port ${port}`);
    }
  );

  return server;
}
