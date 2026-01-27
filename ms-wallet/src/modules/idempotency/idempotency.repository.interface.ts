import { IdempotencyKey } from './idempotency.model';

export interface SaveIdempotencyInput {
  key: string;
  userId: string;
  requestPath: string;
  requestBody?: object;
  expiresAt: Date;
}

export interface UpdateIdempotencyInput {
  key: string;
  responseStatus: number;
  responseBody: object;
}

export interface IIdempotencyRepository {
  findByKey(key: string): Promise<IdempotencyKey | null>;
  create(data: SaveIdempotencyInput): Promise<IdempotencyKey | null>;
  updateWithResponse(data: UpdateIdempotencyInput): Promise<void>;
  deleteExpired(): Promise<number>;
}
