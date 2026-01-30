import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { User } from '../../src/modules/user/entities/user.entity';

const mockUser: User = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'hashed',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn().mockResolvedValue({ token: 'jwt-token' }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      const result = await controller.login({
        email: 'maria@email.com',
        password: 'secret123',
      });

      expect(result).toEqual({ token: 'jwt-token' });
      expect(authService.validateUser).toHaveBeenCalledWith('maria@email.com', 'secret123');
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        controller.login({ email: 'maria@email.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });
});
