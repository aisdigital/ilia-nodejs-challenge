// Set environment variable BEFORE importing WalletClient
process.env.WALLET_SERVICE_URL = 'http://wallet-service:3001';
process.env.INTERNAL_JWT_SECRET = 'test-secret';

import { UserService } from '../../src/services/user.service';
import { UserRepository } from '../../src/repositories/user.repository';
import * as passwordModule from '../../src/lib/password';
import { WalletClient } from '../../src/clients/wallet.client';
import { WalletOutboxRepository } from '../../src/repositories/wallet-outbox.repository';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/lib/password');
jest.mock('../../src/clients/wallet.client');
jest.mock('../../src/repositories/wallet-outbox.repository');

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockWalletClient: jest.Mocked<WalletClient>;
  let mockOutboxRepository: jest.Mocked<WalletOutboxRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockWalletClient = new WalletClient() as jest.Mocked<WalletClient>;
    mockOutboxRepository = new WalletOutboxRepository() as jest.Mocked<WalletOutboxRepository>;
    service = new UserService();
    (service as any).repository = mockRepository;
    (service as any).walletClient = mockWalletClient;
    (service as any).outboxRepository = mockOutboxRepository;
  });

  describe('register', () => {
    it('should create user and outbox with COMPLETED status when wallet sync succeeds', async () => {
      const registerInput = {
        email: 'john@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const hashedPassword = '$2b$10$hashedPasswordString';
      const newUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date('2024-02-03T10:00:00Z'),
        updatedAt: new Date('2024-02-03T10:00:00Z'),
      };

      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce(newUser);
      mockWalletClient.createWalletUser.mockResolvedValueOnce(undefined);
      mockOutboxRepository.create.mockResolvedValueOnce({
        id: 'outbox-123',
        userId: newUser.id,
        eventType: 'USER_CREATED',
        status: 'COMPLETED',
        payload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.register(registerInput);

      expect(passwordModule.hashPassword).toHaveBeenCalledWith(registerInput.password);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: registerInput.email,
        password: hashedPassword,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });
      expect(mockWalletClient.createWalletUser).toHaveBeenCalledWith(newUser.id);
      expect(mockOutboxRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: newUser.id,
        eventType: 'USER_CREATED',
        status: 'COMPLETED',
      }));
      expect(result.id).toBe(newUser.id);
      expect(result.email).toBe(registerInput.email);
      expect(result.token).toBeDefined();
    });

    it('should create user and outbox with PENDING status when wallet sync fails', async () => {
      const registerInput = {
        email: 'sync-fail@example.com',
        password: 'password123',
        firstName: 'Sync',
        lastName: 'Fail',
      };

      const hashedPassword = '$2b$10$hashed';
      const newUser = {
        id: 'uuid-sync-fail',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce(newUser);
      mockWalletClient.createWalletUser.mockRejectedValueOnce(new Error('Network error'));
      mockOutboxRepository.create.mockResolvedValueOnce({
        id: 'outbox-fail',
        userId: newUser.id,
        eventType: 'USER_CREATED',
        status: 'PENDING',
        payload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.register(registerInput);

      expect(result.id).toBe(newUser.id);
      expect(result.email).toBe(registerInput.email);
      expect(result.token).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sync user to wallet', expect.any(Error));
      expect(mockOutboxRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: newUser.id,
        eventType: 'USER_CREATED',
        status: 'PENDING',
      }));

      consoleSpy.mockRestore();
    });

    it('should throw error if email already registered', async () => {
      const registerInput = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockRepository.findByEmail.mockResolvedValueOnce({
        id: 'existing-id',
        email: registerInput.email,
        password: 'hashed',
        firstName: 'Existing',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.register(registerInput)).rejects.toThrow('Email already registered');
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockOutboxRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginInput = {
        email: 'john@example.com',
        password: 'securePassword123',
      };

      const user = {
        id: 'uuid-john',
        email: loginInput.email,
        password: '$2b$10$hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(loginInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordModule.comparePasswords).toHaveBeenCalledWith(loginInput.password, user.password);
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.token).toBeDefined();
      expect(Object.keys(result)).not.toContain('password');
    });

    it('should throw error when user not found', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockRepository.findByEmail.mockResolvedValueOnce(null);

      await expect(service.login(loginInput)).rejects.toThrow('Invalid email or password');
      expect(passwordModule.comparePasswords).not.toHaveBeenCalled();
    });
  });

  describe('getUserWithBalance', () => {
    it('should return user with balance', async () => {
      const userId = 'user-123';

      const user = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce({ amount: 5000 });

      const result = await service.getUserWithBalance(userId);

      expect(result.id).toBe(user.id);
      expect(result.balance).toBe(5000);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockWalletClient.getUserBalance).toHaveBeenCalledWith(userId, undefined);
    });

    it('should throw error if user not found', async () => {
      const userId = 'nonexistent-id';

      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(service.getUserWithBalance(userId)).rejects.toThrow('User not found');
      expect(mockWalletClient.getUserBalance).not.toHaveBeenCalled();
    });
  });

  describe('createTransaction', () => {
    it('should create transaction and update outbox on success', async () => {
      const userId = 'user-123';
      const transactionData = {
        amount: 1000,
        type: 'CREDIT',
      };

      const mockTransaction = {
        id: 'txn-123',
        user_id: userId,
        amount: 1000,
        type: 'CREDIT' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOutboxRepository.createWithinTransaction.mockImplementationOnce(async (callback: any) => {
        return callback({
          walletOutbox: {
            create: jest.fn().mockResolvedValueOnce({
              id: 'outbox-123',
              userId,
              eventType: 'TRANSACTION_CREATED',
              payload: { user_id: userId, amount: 1000, type: 'CREDIT' },
              status: 'PENDING',
            }),
          },
        });
      });

      mockWalletClient.createTransaction.mockResolvedValueOnce(mockTransaction);
      mockOutboxRepository.updateStatus.mockResolvedValueOnce({
        id: 'outbox-123',
        userId,
        eventType: 'TRANSACTION_CREATED',
        status: 'COMPLETED',
        payload: { user_id: userId, amount: 1000, type: 'CREDIT' },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.createTransaction(userId, transactionData);

      expect(mockWalletClient.createTransaction).toHaveBeenCalledWith(
        { ...transactionData, user_id: userId },
        undefined
      );
      expect(mockOutboxRepository.updateStatus).toHaveBeenCalledWith({
        id: 'outbox-123',
        status: 'COMPLETED',
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should handle transaction creation failure gracefully', async () => {
      const userId = 'user-fail';
      const transactionData = {
        amount: 500,
        type: 'DEBIT',
      };

      mockOutboxRepository.createWithinTransaction.mockImplementationOnce(async (callback: any) => {
        return callback({
          walletOutbox: {
            create: jest.fn().mockResolvedValueOnce({
              id: 'outbox-fail',
              userId,
              eventType: 'TRANSACTION_CREATED',
              payload: {},
              status: 'PENDING',
            }),
          },
        });
      });

      mockWalletClient.createTransaction.mockRejectedValueOnce(new Error('API error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.createTransaction(userId, transactionData);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockOutboxRepository.updateStatus).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
