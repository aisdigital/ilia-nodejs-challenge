import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { TransactionType } from './entities/transaction.entity';

@Controller()
export class WalletGrpcController {
  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('CreateWallet')
  async createWallet(data: { user_id: string }) {
    try {
      const wallet = await this.walletService.createWallet(data);
      return {
        wallet: {
          id: wallet.id,
          user_id: wallet.user_id,
          balance: wallet.balance,
          created_at: wallet.created_at.toISOString(),
          updated_at: wallet.updated_at.toISOString(),
        },
        success: true,
        message: 'Wallet created successfully',
      };
    } catch (error) {
      return {
        wallet: null,
        success: false,
        message: error.message,
      };
    }
  }

  @GrpcMethod('GetWalletByUserId')
  async getWalletByUserId(data: { user_id: string }) {
    try {
      const wallet = await this.walletService.findWalletByUserId(data.user_id);
      return {
        wallet: {
          id: wallet.id,
          user_id: wallet.user_id,
          balance: wallet.balance,
          created_at: wallet.created_at.toISOString(),
          updated_at: wallet.updated_at.toISOString(),
        },
        success: true,
        message: 'Wallet found',
      };
    } catch (error) {
      return {
        wallet: null,
        success: false,
        message: error.message,
      };
    }
  }

  @GrpcMethod('CreateTransaction')
  async createTransaction(data: {
    wallet_id: string;
    amount: number;
    type: string;
    description?: string;
  }) {
    try {
      const transaction = await this.walletService.createTransaction({
        wallet_id: data.wallet_id,
        amount: data.amount,
        type: data.type as TransactionType,
        description: data.description,
      });
      return {
        transaction: {
          id: transaction.id,
          wallet_id: transaction.wallet_id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          created_at: transaction.created_at.toISOString(),
          updated_at: transaction.updated_at.toISOString(),
        },
        success: true,
        message: 'Transaction created successfully',
      };
    } catch (error) {
      return {
        transaction: null,
        success: false,
        message: error.message,
      };
    }
  }

  @GrpcMethod('GetTransactions')
  async getTransactions(data: { wallet_id: string }) {
    try {
      const transactions = await this.walletService.getTransactions(data.wallet_id);
      return {
        transactions: transactions.map(tx => ({
          id: tx.id,
          wallet_id: tx.wallet_id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          created_at: tx.created_at.toISOString(),
          updated_at: tx.updated_at.toISOString(),
        })),
        success: true,
        message: 'Transactions found',
      };
    } catch (error) {
      return {
        transactions: [],
        success: false,
        message: error.message,
      };
    }
  }

  @GrpcMethod('GetBalance')
  async getBalance(data: { wallet_id: string }) {
    try {
      const balance = await this.walletService.getBalance(data.wallet_id);
      return {
        balance: balance.balance,
        success: true,
        message: 'Balance retrieved successfully',
      };
    } catch (error) {
      return {
        balance: 0,
        success: false,
        message: error.message,
      };
    }
  }
}
