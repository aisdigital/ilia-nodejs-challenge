// Set environment variable BEFORE importing WalletClient
process.env.WALLET_SERVICE_URL = 'http://wallet-service:3001';

import { UserService } from '../../src/services/UserService';
import { UserRepository } from '../../src/repositories/UserRepository';
import * as passwordModule from '../../src/lib/password';
import { WalletClient } from '../../src/services/WalletClient';

jest.mock('../../src/repositories/UserRepository');
jest.mock('../../src/lib/password');
jest.mock('../../src/services/WalletClient');

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockWalletClient: jest.Mocked<WalletClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = new UserRepository() as jest.Mocked<UserRepository>;
    mockWalletClient = new WalletClient() as jest.Mocked<WalletClient>;
    service = new UserService();
    (service as any).repository = mockRepository;
    (service as any).walletClient = mockWalletClient;
  });

  afterEach(() => {
    // Environment variable is kept for other tests
  });

  describe('register', () => {
    it('should hash password and create user successfully', async () => {
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

      const result = await service.register(registerInput);

      expect(passwordModule.hashPassword).toHaveBeenCalledWith(registerInput.password);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: registerInput.email,
        password: hashedPassword,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });
      expect(result.id).toBe(newUser.id);
      expect(result.email).toBe(registerInput.email);
      expect(result.firstName).toBe(registerInput.firstName);
      expect(result.lastName).toBe(registerInput.lastName);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should call hash function with plain password before saving', async () => {
      const registerInput = {
        email: 'hash@example.com',
        password: 'plainTextPassword123',
        firstName: 'Hash',
        lastName: 'Test',
      };

      const hashedPassword = '$2b$10$N9UoMuK4Q5fN8aP2c3mK9e5f4g3h2i1j0k9l8m7n6o5p4';
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.create.mockResolvedValueOnce({
        id: 'uuid-hash-test',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(registerInput);

      expect(passwordModule.hashPassword).toHaveBeenCalledTimes(1);
      expect(passwordModule.hashPassword).toHaveBeenCalledWith('plainTextPassword123');

      const createCallArgs = mockRepository.create.mock.calls[0][0];
      expect(createCallArgs.password).toBe(hashedPassword);
      expect(createCallArgs.password).not.toBe(registerInput.password);
    });

    it('should not return password in register response', async () => {
      const registerInput = {
        email: 'nopassword@example.com',
        password: 'secretPassword456',
        firstName: 'No',
        lastName: 'Password',
      };

      const hashedPassword = '$2b$10$hashedPasswordString';
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.create.mockResolvedValueOnce({
        id: 'uuid-no-pwd',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.register(registerInput);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('token');
      expect(Object.keys(result)).not.toContain('password');
    });

    it('should throw error if email already registered', async () => {
      const registerInput = {
        email: 'existing@example.com',
        password: 'securePassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: registerInput.email,
        password: '$2b$10$hashedPassword',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(existingUser);

      await expect(service.register(registerInput)).rejects.toThrow('Email already registered');
      expect(passwordModule.hashPassword).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should hash password correctly before saving', async () => {
      const registerInput = {
        email: 'newuser@example.com',
        password: 'myPassword123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const hashedPassword = '$2b$10$hashedPasswordFromBcrypt';
      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce({
        id: 'uuid-123',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(registerInput);

      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.password).toBe(hashedPassword);
      expect(createCall.password).not.toBe(registerInput.password);
    });

    it('should generate JWT token with user data', async () => {
      const registerInput = {
        email: 'jwt@example.com',
        password: 'password123',
        firstName: 'JWT',
        lastName: 'User',
      };

      const hashedPassword = '$2b$10$hashed';
      const newUser = {
        id: 'uuid-jwt-test',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce(newUser);

      const result = await service.register(registerInput);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      const parts = result.token.split('.');
      expect(parts).toHaveLength(3);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginInput = {
        email: 'john@example.com',
        password: 'securePassword123',
      };

      const hashedPassword = '$2b$10$hashedPasswordString';
      const user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: loginInput.email,
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date('2024-02-03T10:00:00Z'),
        updatedAt: new Date('2024-02-03T10:00:00Z'),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(loginInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordModule.comparePasswords).toHaveBeenCalledWith(
        loginInput.password,
        hashedPassword
      );
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
      expect(result.token).toBeDefined();
    });

    it('should return valid JWT token on successful login', async () => {
      const loginInput = {
        email: 'jwt@example.com',
        password: 'password123',
      };

      const user = {
        id: 'uuid-jwt-user',
        email: loginInput.email,
        password: '$2b$10$hashedPassword',
        firstName: 'JWT',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(loginInput);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');

      const parts = result.token.split('.');
      expect(parts).toHaveLength(3);

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      expect(payload.id).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });

    it('should throw error on invalid credentials', async () => {
      const loginInput = {
        email: 'john@example.com',
        password: 'wrongPassword',
      };

      const user = {
        id: 'uuid-123',
        email: loginInput.email,
        password: '$2b$10$correctHashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginInput)).rejects.toThrow('Invalid email or password');
    });

    it('should not return password in login response', async () => {
      const loginInput = {
        email: 'nopwd@example.com',
        password: 'password789',
      };

      const user = {
        id: 'uuid-nopwd',
        email: loginInput.email,
        password: '$2b$10$hashedPassword',
        firstName: 'No',
        lastName: 'Pwd',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(loginInput);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('token');
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

  describe('repository integration', () => {
    it('should call repository.findByEmail during register to check email uniqueness', async () => {
      const registerInput = {
        email: 'check@example.com',
        password: 'password123',
        firstName: 'Check',
        lastName: 'Email',
      };

      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce('hashed');
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce({
        id: 'uuid',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(registerInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(registerInput.email);
    });

    it('should call repository.create with hashed password', async () => {
      const registerInput = {
        email: 'create@example.com',
        password: 'plainPassword',
        firstName: 'Create',
        lastName: 'Test',
      };

      const hashedPassword = '$2b$10$hashed';
      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce(hashedPassword);
      mockRepository.findByEmail.mockResolvedValueOnce(null);
      mockRepository.create.mockResolvedValueOnce({
        id: 'uuid-create',
        email: registerInput.email,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(registerInput);

      expect(mockRepository.create).toHaveBeenCalledWith({
        email: registerInput.email,
        password: hashedPassword,
        firstName: registerInput.firstName,
        lastName: registerInput.lastName,
      });
    });

    it('should call repository.findByEmail during login', async () => {
      const loginInput = {
        email: 'findby@example.com',
        password: 'password123',
      };

      const user = {
        id: 'uuid-findby',
        email: loginInput.email,
        password: '$2b$10$hashed',
        firstName: 'Find',
        lastName: 'By',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(true);

      await service.login(loginInput);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(mockRepository.findByEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const registerInput = {
        email: 'error@example.com',
        password: 'password123',
        firstName: 'Error',
        lastName: 'Test',
      };

      (passwordModule.hashPassword as jest.Mock).mockResolvedValueOnce('hashed');
      mockRepository.findByEmail.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.register(registerInput)).rejects.toThrow('Database error');
    });

    it('should compare password correctly on login failure', async () => {
      const loginInput = {
        email: 'compare@example.com',
        password: 'wrongPassword',
      };

      const user = {
        id: 'uuid-compare',
        email: loginInput.email,
        password: '$2b$10$hashedPassword',
        firstName: 'Compare',
        lastName: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValueOnce(user);
      (passwordModule.comparePasswords as jest.Mock).mockResolvedValueOnce(false);

      await expect(service.login(loginInput)).rejects.toThrow('Invalid email or password');
      expect(passwordModule.comparePasswords).toHaveBeenCalledWith(
        loginInput.password,
        user.password
      );
    });
  });

  describe('getUserWithBalance', () => {
    it('should fetch user and combine with wallet balance', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const correlationId = 'corr-123';

      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const balanceResponse = { amount: 5000 };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce(balanceResponse);

      const result = await service.getUserWithBalance(userId, correlationId);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockWalletClient.getUserBalance).toHaveBeenCalledWith(userId, correlationId);
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: 5000,
      });
    });

    it('should use user id from token payload correctly', async () => {
      const tokenUserId = '550e8400-e29b-41d4-a716-446655440001';

      const user = {
        id: tokenUserId,
        email: 'tokenuser@example.com',
        firstName: 'Token',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce({ amount: 1000 });

      const result = await service.getUserWithBalance(tokenUserId);

      expect(mockRepository.findById).toHaveBeenCalledWith(tokenUserId);
      expect(result.id).toBe(tokenUserId);
      expect(result.email).toBe('tokenuser@example.com');
    });

    it('should return user with null balance when wallet service is unavailable', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce({ amount: null });

      const result = await service.getUserWithBalance(userId);

      expect(result).toEqual({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        balance: null,
      });
    });

    it('should throw error when user is not found', async () => {
      const userId = 'non-existent-id';

      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(service.getUserWithBalance(userId)).rejects.toThrow('User not found');
      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockWalletClient.getUserBalance).not.toHaveBeenCalled();
    });

    it('should forward correlation id to wallet client', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';
      const correlationId = 'unique-corr-id-456';

      const user = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce({ amount: 1000 });

      await service.getUserWithBalance(userId, correlationId);

      expect(mockWalletClient.getUserBalance).toHaveBeenCalledWith(userId, correlationId);
    });

    it('should not expose sensitive data in response', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440000';

      const user = {
        id: userId,
        email: 'secure@example.com',
        firstName: 'Secure',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValueOnce(user);
      mockWalletClient.getUserBalance.mockResolvedValueOnce({ amount: 2000 });

      const result = await service.getUserWithBalance(userId);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
      expect(Object.keys(result).sort()).toEqual(
        ['id', 'email', 'firstName', 'lastName', 'balance'].sort()
      );
    });
  });
});
