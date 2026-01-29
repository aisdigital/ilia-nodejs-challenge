import { Test } from '@nestjs/testing';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get(AuthService);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };
      const user = { userId: 1, username: 'admin' };
      const expectedResult = { access_token: 'mock-jwt-token' };

      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(authService.validateUser).toHaveBeenCalledWith('admin', 'admin123');
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { username: 'admin', password: 'wrongpassword' };

      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow('Unauthorized');
      expect(authService.validateUser).toHaveBeenCalledWith('admin', 'wrongpassword');
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should handle empty credentials', async () => {
      const loginDto = { username: '', password: '' };

      authService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow('Unauthorized');
      expect(authService.validateUser).toHaveBeenCalledWith('', '');
    });

    it('should handle service errors gracefully', async () => {
      const loginDto = { username: 'admin', password: 'admin123' };
      const error = new Error('Service error');

      authService.validateUser.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
    });
  });
});
