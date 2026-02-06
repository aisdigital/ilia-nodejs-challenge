import { WalletOutbox, CreateOutboxRequest, UpdateOutboxStatusRequest, FindOutboxByStatusRequest } from '../types/outbox.types';

export interface IWalletOutboxRepository {
  create(request: CreateOutboxRequest): Promise<WalletOutbox>;
  findById(id: string): Promise<WalletOutbox | null>;
  findByUserId(userId: string): Promise<WalletOutbox[]>;
  findByStatus(request: FindOutboxByStatusRequest): Promise<WalletOutbox[]>;
  updateStatus(request: UpdateOutboxStatusRequest): Promise<WalletOutbox>;
  delete(id: string): Promise<void>;
}
