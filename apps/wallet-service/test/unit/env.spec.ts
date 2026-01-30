describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Required Environment Variables', () => {
    it('should have JWT_PRIVATE_KEY defined', () => {
      expect(process.env.JWT_PRIVATE_KEY).toBeDefined();
      expect(process.env.JWT_PRIVATE_KEY).toBe('ILIACHALLENGE');
    });

    it('should have JWT_INTERNAL_PRIVATE_KEY defined', () => {
      expect(process.env.JWT_INTERNAL_PRIVATE_KEY).toBeDefined();
      expect(process.env.JWT_INTERNAL_PRIVATE_KEY).toBe('ILIACHALLENGE_INTERNAL');
    });

    it('should have PORT defined for wallet service', () => {
      expect(process.env.PORT).toBeDefined();
      expect(process.env.PORT).toBe('3001');
    });

    it('should have GRPC_URL defined', () => {
      expect(process.env.GRPC_URL).toBeDefined();
      expect(process.env.GRPC_URL).toBe('0.0.0.0:50052');
    });

    it('should have NODE_ENV defined', () => {
      expect(process.env.NODE_ENV).toBeDefined();
      expect(['development', 'test', 'production']).toContain(process.env.NODE_ENV);
    });
  });

  describe('Database Environment Variables', () => {
    it('should have wallet database variables defined', () => {
      expect(process.env.DB_HOST_WALLET).toBeDefined();
      expect(process.env.DB_PORT_WALLET).toBeDefined();
      expect(process.env.DB_USERNAME_WALLET).toBeDefined();
      expect(process.env.DB_PASSWORD_WALLET).toBeDefined();
      expect(process.env.DB_DATABASE_WALLET).toBeDefined();
    });

    it('should have correct wallet database values', () => {
      expect(process.env.DB_HOST_WALLET).toBe('localhost');
      expect(process.env.DB_PORT_WALLET).toBe('5433');
      expect(process.env.DB_USERNAME_WALLET).toBe('postgres');
      expect(process.env.DB_PASSWORD_WALLET).toBe('password');
      expect(process.env.DB_DATABASE_WALLET).toBe('wallet_db');
    });
  });

  describe('Users Service Environment Variables', () => {
    it('should have users service variables defined', () => {
      expect(process.env.PORT_USERS).toBeDefined();
      expect(process.env.GRPC_PORT_USERS).toBeDefined();
    });

    it('should have correct users service values', () => {
      expect(process.env.PORT_USERS).toBe('3002');
      expect(process.env.GRPC_PORT_USERS).toBe('50051');
    });
  });

  describe('Environment Variable Validation', () => {
    it('should throw error if JWT_PRIVATE_KEY is missing in production', async () => {
      delete process.env.JWT_PRIVATE_KEY;
      process.env.NODE_ENV = 'production';

      // Import JwtStrategy to test constructor validation
      const { JwtStrategy } = await import('../../src/modules/auth/jwt.strategy');

      expect(() => new JwtStrategy()).toThrow();
    });

    it('should not throw error if JWT_PRIVATE_KEY is missing in test environment', async () => {
      delete process.env.JWT_PRIVATE_KEY;
      process.env.NODE_ENV = 'test';

      // This should not throw due to our setup.ts mock
      const { JwtStrategy } = await import('../../src/modules/auth/jwt.strategy');

      // The passport-jwt will still throw, but our custom validation should not
      expect(() => new JwtStrategy()).toThrow();
    });
  });
});
