import jwt from 'jsonwebtoken';
import { hashPassword, comparePasswords } from '../lib/password';
import { UserRepository } from '../repositories/UserRepository';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { WalletClient } from '../clients/WalletClient';
import { WalletCreationOutboxRepository } from '../repositories/WalletCreationOutboxRepository';
import { AuthServiceResponse, UserWithBalanceResponse } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export class UserService {
  private readonly repository: UserRepository;
  private readonly walletClient: WalletClient;
  private readonly outboxRepository: WalletCreationOutboxRepository;

  constructor() {
    this.repository = new UserRepository();
    this.walletClient = new WalletClient();
    this.outboxRepository = new WalletCreationOutboxRepository();
  }

  async register(data: RegisterInput): Promise<AuthServiceResponse> {
    const existingUser = await this.repository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.repository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthServiceResponse> {
    const user = await this.repository.findByEmail(data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await comparePasswords(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  async getUserWithBalance(userId: string, correlationId?: string): Promise<UserWithBalanceResponse> {
    const user = await this.repository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const balanceData = await this.walletClient.getUserBalance(userId, correlationId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      balance: balanceData.amount,
    };
  }

  async createTransaction(userId: string, data: any, correlationId?: string) {
    const outboxId = await this.outboxRepository.createWithinTransaction(async (tx: any) => {
      const outbox = await tx.walletCreationOutbox.create({
        data: {
          userId,
          payload: {
            user_id: userId,
            amount: data.amount,
            type: data.type,
          },
          status: 'PENDING',
        },
      });

      return outbox.id;
    });

    try {
      const transaction = await this.walletClient.createTransaction(
        { ...data, user_id: userId },
        correlationId
      );

      await this.outboxRepository.updateStatus({
        id: outboxId,
        status: 'COMPLETED',
      });

      return transaction;
    } catch (error) {
      console.error(`Failed to create transaction for user ${userId}. Outbox ID: ${outboxId}`, error);
      return null;
    }
  }

  async getTransactions(userId: string, correlationId?: string) {
    return this.walletClient.getTransactions(userId, correlationId);
  }

  async getBalance(userId: string, correlationId?: string) {
    return this.walletClient.getBalance(userId, correlationId);
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, JWT_SECRET!, { expiresIn: '24h' });
  }
}
