import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

process.env.JWT_PRIVATE_KEY = 'test-secret-key';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_PRIVATE_KEY = 'test-secret-key';

    const moduleRef = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should validate payload with sub and email', async () => {
      const payload = { sub: 'user-uuid', email: 'user@example.com' };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        userId: 'user-uuid',
        email: 'user@example.com',
        username: undefined,
      });
    });

    it('should handle payload with username (legacy)', async () => {
      const payload = { sub: '1', username: 'admin' };
      const result = await strategy.validate(payload);
      expect(result).toEqual({ userId: '1', email: undefined, username: 'admin' });
    });

    it('should handle empty payload', async () => {
      const payload = {};
      const result = await strategy.validate(payload as any);
      expect(result).toEqual({ userId: undefined, email: undefined, username: undefined });
    });

    it('should handle null payload gracefully', async () => {
      await expect(strategy.validate(null as any)).rejects.toThrow();
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
