import { PrismaClient, WalletUser as PrismaWalletUser } from '@prisma/client';
import { IWalletUserRepository } from './wallet-user.repository.interface';
import { WalletUser, CreateWalletUserRequest } from '../types/wallet-user.types';
import prisma from '../lib/prisma';

export class WalletUserRepository implements IWalletUserRepository {
  constructor(private client: PrismaClient = prisma) {}

  async create(request: CreateWalletUserRequest): Promise<WalletUser> {
    const walletUser = await this.client.walletUser.create({
      data: {
        externalUserId: request.externalUserId,
      },
    });

    return this.mapToWalletUser(walletUser);
  }

  async findById(id: string): Promise<WalletUser | null> {
    const walletUser = await this.client.walletUser.findUnique({
      where: { id },
    });

    return walletUser ? this.mapToWalletUser(walletUser) : null;
  }

  async findByExternalUserId(externalUserId: string): Promise<WalletUser | null> {
    const walletUser = await this.client.walletUser.findUnique({
      where: { externalUserId },
    });

    return walletUser ? this.mapToWalletUser(walletUser) : null;
  }

  async delete(id: string): Promise<void> {
    await this.client.walletUser.delete({
      where: { id },
    });
  }

  async exists(externalUserId: string): Promise<boolean> {
    const count = await this.client.walletUser.count({
      where: { externalUserId },
    });

    return count > 0;
  }

  private mapToWalletUser(walletUser: PrismaWalletUser): WalletUser {
    return {
      id: walletUser.id,
      externalUserId: walletUser.externalUserId,
      createdAt: walletUser.createdAt,
    };
  }
}
