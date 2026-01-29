import { Test } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get(JwtService);
  });

  describe('validateUser', () => {
    it('should validate admin user successfully', async () => {
      const result = await service.validateUser('admin', 'admin123');

      expect(result).toEqual({ userId: 1, username: 'admin' });
    });

    it('should validate regular user successfully', async () => {
      const result = await service.validateUser('user', 'user123');

      expect(result).toEqual({ userId: 2, username: 'user' });
    });

    it('should return null for invalid username', async () => {
      const result = await service.validateUser('invalid', 'admin123');

      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      const result = await service.validateUser('admin', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null for empty credentials', async () => {
      const result = await service.validateUser('', '');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate JWT token for valid user', async () => {
      const user = { userId: 1, username: 'admin' };
      const expectedToken = 'mock-jwt-token';
      
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: expectedToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'admin',
        sub: 1,
      });
    });

    it('should handle different user types', async () => {
      const user = { userId: 2, username: 'user' };
      const expectedToken = 'mock-jwt-token-2';
      
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: expectedToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'user',
        sub: 2,
      });
    });

    it('should handle empty user object', async () => {
      const user = { userId: undefined, username: undefined };
      const expectedToken = 'mock-jwt-token-empty';
      
      jwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: expectedToken });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: undefined,
        sub: undefined,
      });
    });
  });
});
