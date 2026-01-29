import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';
import { AuthService } from '../../src/modules/auth/auth.service';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.JWT_PRIVATE_KEY = 'test-secret-key';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(async () => {
    // Set up test environment
    const originalEnv = process.env.NODE_ENV;
    const originalJwtKey = process.env.JWT_PRIVATE_KEY;
    
    process.env.NODE_ENV = 'test';
    process.env.JWT_PRIVATE_KEY = 'test-secret-key';

    const mockAuthService = {
      validateUser: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = moduleRef.get<JwtStrategy>(JwtStrategy);
    authService = moduleRef.get(AuthService);
  });

  describe('validate', () => {
    it('should validate user successfully with valid payload', async () => {
      const payload = { username: 'admin', sub: 1 };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: 1, username: 'admin' });
    });

    it('should handle validation with missing username', async () => {
      const payload = { sub: 999 };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: 999, username: undefined });
    });

    it('should handle validation with missing sub', async () => {
      const payload = { username: 'admin' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: undefined, username: 'admin' });
    });

    it('should handle empty payload', async () => {
      const payload = {};

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: undefined, username: undefined });
    });

    it('should handle null payload gracefully', async () => {
      const payload = null;

      // The actual strategy will throw an error with null payload, so we expect that
      await expect(strategy.validate(payload)).rejects.toThrow();
    });
  });

  describe('constructor', () => {
    it('should throw if JWT_PRIVATE_KEY is not set and NODE_ENV is not test', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalJwtKey = process.env.JWT_PRIVATE_KEY;
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_PRIVATE_KEY;

      expect(() => new JwtStrategy()).toThrow();

      process.env.NODE_ENV = originalEnv;
      process.env.JWT_PRIVATE_KEY = originalJwtKey;
    });

    it('should not throw if JWT_PRIVATE_KEY is set and NODE_ENV is not test', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalJwtKey = process.env.JWT_PRIVATE_KEY;
      process.env.NODE_ENV = 'production';
      process.env.JWT_PRIVATE_KEY = 'some-secret-key';

      expect(() => new JwtStrategy()).not.toThrow();

      process.env.NODE_ENV = originalEnv;
      process.env.JWT_PRIVATE_KEY = originalJwtKey;
    });
  });
});
