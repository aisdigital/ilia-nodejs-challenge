import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  created_at: string;
}

export interface WalletBalance {
  amount: number;
}

export class WalletService {
  private client: AxiosInstance;
  private internalJwtSecret: string;

  constructor(walletServiceUrl: string, internalJwtSecret: string) {
    this.internalJwtSecret = internalJwtSecret;
    this.client = axios.create({
      baseURL: walletServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include internal JWT
    this.client.interceptors.request.use((config) => {
      const internalToken = this.generateInternalToken();
      config.headers.Authorization = `Bearer ${internalToken}`;
      return config;
    });
  }

  private generateInternalToken(): string {
    return jwt.sign(
      { 
        service: 'ms-users',
        internal: true 
      },
      this.internalJwtSecret,
      { expiresIn: '5m' }
    );
  }

  async getUserTransactions(userId: string, type?: 'CREDIT' | 'DEBIT'): Promise<WalletTransaction[]> {
    try {
      const params: any = {};
      if (type) {
        params.type = type;
      }

      // Create user token for wallet service
      const userToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '5m' });
      
      const response = await this.client.get('/api/transactions', {
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        params
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      throw new Error('Failed to communicate with wallet service');
    }
  }

  async getUserBalance(userId: string): Promise<WalletBalance> {
    try {
      // Create user token for wallet service
      const userToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '5m' });
      
      const response = await this.client.get('/api/balance', {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get user balance:', error);
      throw new Error('Failed to communicate with wallet service');
    }
  }
}