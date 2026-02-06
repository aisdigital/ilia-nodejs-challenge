import { PrismaClient, WalletOutbox as PrismaWalletOutbox, OutboxStatus as PrismaOutboxStatus, EventType as PrismaEventType } from '@prisma/client';
import { IWalletCreationOutboxRepository } from './wallet-creation-outbox.repository.interface';
import { WalletOutbox, CreateOutboxRequest, UpdateOutboxStatusRequest, OutboxStatus, EventType, FindOutboxByStatusRequest } from '../types/outbox.types';
import prisma from '../lib/prisma';

export class WalletCreationOutboxRepository implements IWalletCreationOutboxRepository {
  constructor(private client: PrismaClient = prisma) {}

  async create(request: CreateOutboxRequest): Promise<WalletOutbox> {
    const outbox = await this.client.walletOutbox.create({
      data: {
        userId: request.userId,
        eventType: request.eventType,
        payload: request.payload,
        status: 'PENDING',
      },
    });

    return this.mapToWalletOutbox(outbox);
  }

  async findById(id: string): Promise<WalletOutbox | null> {
    const outbox = await this.client.walletOutbox.findUnique({
      where: { id },
    });

    return outbox ? this.mapToWalletOutbox(outbox) : null;
  }

  async findByUserId(userId: string): Promise<WalletOutbox[]> {
    const outboxes = await this.client.walletOutbox.findMany({
      where: { userId },
    });

    return outboxes.map((outbox: PrismaWalletOutbox) => this.mapToWalletOutbox(outbox));
  }

  async findByStatus(request: FindOutboxByStatusRequest): Promise<WalletOutbox[]> {
    const where: any = { status: request.status as PrismaOutboxStatus };

    if (request.eventType) {
      where.eventType = request.eventType as PrismaEventType;
    }

    const outboxes = await this.client.walletOutbox.findMany({ where });

    return outboxes.map((outbox: PrismaWalletOutbox) => this.mapToWalletOutbox(outbox));
  }

  async updateStatus(request: UpdateOutboxStatusRequest): Promise<WalletOutbox> {
    const outbox = await this.client.walletOutbox.update({
      where: { id: request.id },
      data: { status: request.status as PrismaOutboxStatus },
    });

    return this.mapToWalletOutbox(outbox);
  }

  async delete(id: string): Promise<void> {
    await this.client.walletOutbox.delete({
      where: { id },
    });
  }

  async createWithinTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.client.$transaction(callback);
  }

  private mapToWalletOutbox(outbox: PrismaWalletOutbox): WalletOutbox {
    return {
      id: outbox.id,
      userId: outbox.userId,
      eventType: outbox.eventType as EventType,
      status: outbox.status as OutboxStatus,
      payload: outbox.payload as Record<string, unknown>,
      createdAt: outbox.createdAt,
      updatedAt: outbox.updatedAt,
    };
  }
}




