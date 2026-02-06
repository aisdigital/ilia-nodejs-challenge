export type OutboxStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface WalletCreationOutboxPayload {
  [key: string]: any;
}

export interface WalletCreationOutbox {
  id: string;
  userId: string;
  status: OutboxStatus;
  payload: WalletCreationOutboxPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutboxRequest {
  userId: string;
  payload: WalletCreationOutboxPayload;
}

export interface UpdateOutboxStatusRequest {
  id: string;
  status: OutboxStatus;
}
