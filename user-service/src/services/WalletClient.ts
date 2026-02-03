import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;
const INTERNAL_JWT_SECRET = process.env.INTERNAL_JWT_SECRET || 'ILIACHALLENGE_INTERNAL';

if (!WALLET_SERVICE_URL) {
  throw new Error('WALLET_SERVICE_URL environment variable is required');
}

export interface BalanceResponse {
  amount: number | null;
}

export class WalletClient {
  private axiosInstance = axios.create({
    baseURL: WALLET_SERVICE_URL,
    timeout: 5000,
  });

  private generateInternalToken(): string {
    return jwt.sign({ internal: true }, INTERNAL_JWT_SECRET, { expiresIn: '5m' });
  }

  async getUserBalance(userId: string, correlationId?: string): Promise<BalanceResponse> {
    try {
      const token = this.generateInternalToken();

      const headers: any = {
        Authorization: `Bearer ${token}`,
      };

      if (correlationId) {
        headers['x-correlation-id'] = correlationId;
      }

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

      console.error('Unexpected error fetching wallet balance:', error);
      return { amount: null };
    }
  }

  private handleAxiosError(error: AxiosError, userId: string): BalanceResponse {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn(`Wallet service unavailable for user ${userId}. Returning null balance.`);
      return { amount: null };
    }

    if (error.response?.status === 401) {
      console.error(`Unauthorized access to wallet service for user ${userId}`);
      return { amount: null };
    }

    if (error.response?.status === 404) {
      console.warn(`Wallet not found for user ${userId}`);
      return { amount: null };
    }

    if (error.response?.status === 500) {
      console.error(`Wallet service internal error for user ${userId}`);
      return { amount: null };
    }

    if (error.code === 'ECONNABORTED') {
      console.error(`Wallet service timeout for user ${userId}`);
      return { amount: null };
    }

    console.error(`Error fetching wallet balance for user ${userId}:`, error.message);
    return { amount: null };
  }
}
