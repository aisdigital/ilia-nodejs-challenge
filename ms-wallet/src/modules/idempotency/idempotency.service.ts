import { IIdempotencyRepository } from './idempotency.repository.interface';
import { IdempotencyRepository } from './idempotency.repository';

export interface IdempotencyCheckResult {
  isNew: boolean;
  existingResponse?: {
    status: number;
    body: object;
  };
}

export interface IdempotencyConfig {
  ttlHours: number; 
}

const DEFAULT_CONFIG: IdempotencyConfig = {
  ttlHours: 24,
};

export class IdempotencyService {
  private config: IdempotencyConfig;

  constructor(
    private repository: IIdempotencyRepository = new IdempotencyRepository(),
    config?: Partial<IdempotencyConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async checkAndRegister(
    key: string,
    userId: string,
    requestPath: string,
    requestBody?: object
  ): Promise<IdempotencyCheckResult> {
    const existing = await this.repository.findByKey(key);

    if (existing) {
      if (existing.response_status !== null && existing.response_body !== null) {
        return {
          isNew: false,
          existingResponse: {
            status: existing.response_status,
            body: existing.response_body,
          },
        };
      }

      throw new IdempotencyConflictError(
        'Request with this idempotency key is already being processed'
      );
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.config.ttlHours);

    const created = await this.repository.create({
      key,
      userId,
      requestPath,
      requestBody,
      expiresAt,
    });

    if (!created) {      
      const retryExisting = await this.repository.findByKey(key);
      
      if (retryExisting?.response_status !== null && retryExisting?.response_body) {
        return {
          isNew: false,
          existingResponse: {
            status: retryExisting.response_status,
            body: retryExisting.response_body,
          },
        };
      }

      throw new IdempotencyConflictError(
        'Request with this idempotency key is already being processed'
      );
    }

    return { isNew: true };
  }

  async saveResponse(key: string, status: number, body: object): Promise<void> {
    await this.repository.updateWithResponse({
      key,
      responseStatus: status,
      responseBody: body,
    });
  }

  async cleanupExpired(): Promise<number> {
    return this.repository.deleteExpired();
  }
}

export class IdempotencyConflictError extends Error {
  public readonly statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = 'IdempotencyConflictError';
  }
}
