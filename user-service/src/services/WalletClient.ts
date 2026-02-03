import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://wallet-service:3001';
const INTERNAL_JWT_SECRET = process.env.ILIACHALLENGE_INTERNAL || 'ILIACHALLENGE_INTERNAL';

export interface BalanceResponse {
  amount: number;
}

export class WalletClient {
  private axiosInstance = axios.create({
    baseURL: WALLET_SERVICE_URL,
    timeout: 5000,
  });

  private generateInternalToken(): string {
    return jwt.sign({ internal: true }, INTERNAL_JWT_SECRET, { expiresIn: '5m' });
  }

  async getUserBalance(userId: string): Promise<BalanceResponse> {
    try {
      const token = this.generateInternalToken();

      const response = await this.axiosInstance.get<BalanceResponse>('/balance', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-Id': userId,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) || (error && typeof error === 'object' && 'code' in error)) {
        return this.handleAxiosError(error as AxiosError, userId);
      }

      console.error('Unexpected error fetching wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  private handleAxiosError(error: AxiosError, userId: string): BalanceResponse {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn(`Wallet service unavailable for user ${userId}. Returning zero balance.`);
      return { amount: 0 };
    }

    if (error.response?.status === 401) {
      console.error(`Unauthorized access to wallet service for user ${userId}`);
      return { amount: 0 };
    }

    if (error.response?.status === 404) {
      console.warn(`Wallet not found for user ${userId}`);
      return { amount: 0 };
    }

    if (error.response?.status === 500) {
      console.error(`Wallet service internal error for user ${userId}`);
      throw new Error('Wallet service error');
    }

    if (error.code === 'ECONNABORTED') {
      console.error(`Wallet service timeout for user ${userId}`);
      throw new Error('Wallet service timeout');
    }

    console.error(`Error fetching wallet balance for user ${userId}:`, error.message);
    throw new Error('Failed to fetch wallet balance');
  }
}
