import { PrismaClient, WalletCreationOutbox as PrismaWalletCreationOutbox, OutboxStatus as PrismaOutboxStatus } from '@prisma/client';
import { IWalletCreationOutboxRepository } from './IWalletCreationOutboxRepository';
import { WalletCreationOutbox, CreateOutboxRequest, UpdateOutboxStatusRequest, OutboxStatus } from '../types/outbox.types';

export class WalletCreationOutboxRepository implements IWalletCreationOutboxRepository {
  constructor(private prisma: PrismaClient) {}

  async create(request: CreateOutboxRequest): Promise<WalletCreationOutbox> {
    const outbox = await this.prisma.walletCreationOutbox.create({
      data: {
        userId: request.userId,
        payload: request.payload,
        status: 'PENDING',
      },
    });

    return this.mapToWalletCreationOutbox(outbox);
  }

  async findById(id: string): Promise<WalletCreationOutbox | null> {
    const outbox = await this.prisma.walletCreationOutbox.findUnique({
      where: { id },
    });

    return outbox ? this.mapToWalletCreationOutbox(outbox) : null;
  }

  async findByUserId(userId: string): Promise<WalletCreationOutbox[]> {
    const outboxes = await this.prisma.walletCreationOutbox.findMany({
      where: { userId },
    });

    return outboxes.map((outbox: PrismaWalletCreationOutbox) => this.mapToWalletCreationOutbox(outbox));
  }

  async findByStatus(status: OutboxStatus): Promise<WalletCreationOutbox[]> {
    const outboxes = await this.prisma.walletCreationOutbox.findMany({
      where: { status: status as PrismaOutboxStatus },
    });

    return outboxes.map((outbox: PrismaWalletCreationOutbox) => this.mapToWalletCreationOutbox(outbox));
  }

  async updateStatus(request: UpdateOutboxStatusRequest): Promise<WalletCreationOutbox> {
    const outbox = await this.prisma.walletCreationOutbox.update({
      where: { id: request.id },
      data: { status: request.status as PrismaOutboxStatus },
    });

    return this.mapToWalletCreationOutbox(outbox);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.walletCreationOutbox.delete({
      where: { id },
    });
  }

  private mapToWalletCreationOutbox(outbox: PrismaWalletCreationOutbox): WalletCreationOutbox {
    return {
      id: outbox.id,
      userId: outbox.userId,
      status: outbox.status as OutboxStatus,
      payload: outbox.payload as Record<string, unknown>,
      createdAt: outbox.createdAt,
      updatedAt: outbox.updatedAt,
    };
  }
}
