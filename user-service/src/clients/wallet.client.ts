import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';
import { BalanceResponse, TransactionData, Transaction, TransactionsResponse } from '../types/wallet-client.types';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;
const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET;

if (!WALLET_SERVICE_URL) {
  throw new Error('WALLET_SERVICE_URL environment variable is required');
}
if (!INTERNAL_JWT_SECRET) {
  throw new Error('INTERNAL_JWT_SECRET environment variable is required');
}

export class WalletClient {
  private axiosInstance = axios.create({
    baseURL: WALLET_SERVICE_URL,
    timeout: 5000,
  });

  private generateInternalToken(): string {
    return jwt.sign({ internal: true }, INTERNAL_JWT_SECRET!, { expiresIn: '5m' });
  }

  private getHeaders(correlationId?: string): any {
    const headers: any = {
      Authorization: `Bearer ${this.generateInternalToken()}`,
    };

    if (correlationId) {
      headers['x-correlation-id'] = correlationId;
    }

    return headers;
  }

  async getUserBalance(userId: string, correlationId?: string): Promise<BalanceResponse> {
    try {
      const headers = this.getHeaders(correlationId);

      const response = await this.axiosInstance.get<BalanceResponse>('/balance', {
        params: {
          user_id: userId,
        },
        headers,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) || (error && typeof error === 'object' && 'code' in error)) {
        return this.handleAxiosError(error as AxiosError, userId);
      }

      return { amount: null };
    }
  }

  async getBalance(userId: string, correlationId?: string): Promise<BalanceResponse> {
    return this.getUserBalance(userId, correlationId);
  }

  async createTransaction(data: TransactionData, correlationId?: string): Promise<Transaction> {
    try {
      const response = await this.axiosInstance.post<Transaction>('/transactions', data, {
        headers: this.getHeaders(correlationId),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to create transaction');
      }
      throw new Error('Failed to create transaction');
    }
  }

  async createWalletUser(userId: string, correlationId?: string): Promise<void> {
    try {
      await this.axiosInstance.post('/wallet/users', { user_id: userId }, {
        headers: this.getHeaders(correlationId),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error('Failed to create wallet user');
      }
      throw error;
    }
  }

  async getTransactions(userId: string, correlationId?: string): Promise<TransactionsResponse> {
    try {
      const response = await this.axiosInstance.get<TransactionsResponse>('/transactions', {
        params: {
          user_id: userId,
        },
        headers: this.getHeaders(correlationId),
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { transactions: [] };
      }
      return { transactions: [] };
    }
  }

  private handleAxiosError(_error: AxiosError, _userId: string): BalanceResponse {
    return { amount: null };
  }
}
