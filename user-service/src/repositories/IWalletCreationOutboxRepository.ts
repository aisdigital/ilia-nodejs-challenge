import { WalletCreationOutbox, CreateOutboxRequest, UpdateOutboxStatusRequest, OutboxStatus } from '../types/outbox.types';

export interface IWalletCreationOutboxRepository {
  create(request: CreateOutboxRequest): Promise<WalletCreationOutbox>;
  findById(id: string): Promise<WalletCreationOutbox | null>;
  findByUserId(userId: string): Promise<WalletCreationOutbox[]>;
  findByStatus(status: OutboxStatus): Promise<WalletCreationOutbox[]>;
  updateStatus(request: UpdateOutboxStatusRequest): Promise<WalletCreationOutbox>;
  delete(id: string): Promise<void>;
}
