export type OutboxStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type EventType = 'USER_CREATED' | 'TRANSACTION_CREATED';

export interface WalletOutboxPayload {
  [key: string]: any;
}

export interface WalletOutbox {
  id: string;
  userId: string;
  eventType: EventType;
  status: OutboxStatus;
  payload: WalletOutboxPayload;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutboxRequest {
  userId: string;
  eventType: EventType;
  payload: WalletOutboxPayload;
  status?: OutboxStatus;
}

export interface UpdateOutboxStatusRequest {
  id: string;
  status: OutboxStatus;
}

export interface FindOutboxByStatusRequest {
  status: OutboxStatus;
  eventType?: EventType;
}

