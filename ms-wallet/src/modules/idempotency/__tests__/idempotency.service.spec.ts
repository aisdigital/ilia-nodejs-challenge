import { IdempotencyService, IdempotencyConflictError } from '../idempotency.service';
import { IIdempotencyRepository } from '../idempotency.repository.interface';
import { IdempotencyKey } from '../idempotency.model';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let mockRepository: jest.Mocked<IIdempotencyRepository>;

  const mockIdempotencyKey = (overrides: Partial<IdempotencyKey> = {}): IdempotencyKey => ({
    id: 'key-id',
    key: 'test-key',
    user_id: 'user-123',
    request_path: '/transactions',
    request_body: { amount: 100 },
    response_status: null,
    response_body: null,
    created_at: new Date(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ...overrides,
  } as IdempotencyKey);

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findByKey: jest.fn(),
      create: jest.fn(),
      updateWithResponse: jest.fn(),
      deleteExpired: jest.fn(),
    };

    service = new IdempotencyService(mockRepository, { ttlHours: 24 });
  });

  describe('checkAndRegister', () => {
    const key = 'test-idempotency-key';
    const userId = 'user-123';
    const requestPath = '/transactions';
    const requestBody = { amount: 100, type: 'CREDIT' };

    it('should return isNew=true for a new idempotency key', async () => {
      mockRepository.findByKey.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockIdempotencyKey({ key }));

      const result = await service.checkAndRegister(key, userId, requestPath, requestBody);

      expect(result.isNew).toBe(true);
      expect(result.existingResponse).toBeUndefined();
      expect(mockRepository.findByKey).toHaveBeenCalledWith(key);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        key,
        userId,
        requestPath,
        requestBody,
      }));
    });

    it('should return existing response for completed idempotency key', async () => {
      const existingKey = mockIdempotencyKey({
        key,
        response_status: 201,
        response_body: { id: 'tx-123', success: true },
      });
      mockRepository.findByKey.mockResolvedValue(existingKey);

      const result = await service.checkAndRegister(key, userId, requestPath, requestBody);

      expect(result.isNew).toBe(false);
      expect(result.existingResponse).toEqual({
        status: 201,
        body: { id: 'tx-123', success: true },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw IdempotencyConflictError when key exists but response is not ready', async () => {
      const existingKey = mockIdempotencyKey({
        key,
        response_status: null,
        response_body: null,
      });
      mockRepository.findByKey.mockResolvedValue(existingKey);

      await expect(
        service.checkAndRegister(key, userId, requestPath, requestBody)
      ).rejects.toThrow(IdempotencyConflictError);
    });

    it('should handle race condition when create returns null', async () => {
      const completedKey = mockIdempotencyKey({
        key,
        response_status: 201,
        response_body: { success: true },
      });

      mockRepository.findByKey
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(completedKey);
      mockRepository.create.mockResolvedValue(null);

      const result = await service.checkAndRegister(key, userId, requestPath, requestBody);

      expect(result.isNew).toBe(false);
      expect(result.existingResponse).toEqual({
        status: 201,
        body: { success: true },
      });
    });
  });

  describe('saveResponse', () => {
    it('should update the idempotency key with response', async () => {
      const key = 'test-key';
      const status = 201;
      const body = { id: 'tx-123', success: true };

      await service.saveResponse(key, status, body);

      expect(mockRepository.updateWithResponse).toHaveBeenCalledWith({
        key,
        responseStatus: status,
        responseBody: body,
      });
    });
  });

  describe('cleanupExpired', () => {
    it('should delete expired keys and return count', async () => {
      mockRepository.deleteExpired.mockResolvedValue(5);

      const result = await service.cleanupExpired();

      expect(result).toBe(5);
      expect(mockRepository.deleteExpired).toHaveBeenCalled();
    });
  });
});

describe('IdempotencyConflictError', () => {
  it('should have correct statusCode and name', () => {
    const error = new IdempotencyConflictError('Test message');

    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('IdempotencyConflictError');
    expect(error.message).toBe('Test message');
  });
});
