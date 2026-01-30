import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/user/user.service';
import { User } from '../../src/modules/user/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUser: User = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'hashed',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt-token'),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user when email and password match', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await service.validateUser('maria@email.com', 'secret123');

      expect(result).toEqual(mockUser);
      expect(userService.findOneByEmail).toHaveBeenCalledWith('maria@email.com');
    });

    it('should return null when user not found', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      const result = await service.validateUser('unknown@email.com', 'secret');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      const bcryptModule = await import('bcrypt');
      (bcryptModule.compare as jest.Mock).mockResolvedValueOnce(false);
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(mockUser);

      const result = await service.validateUser('maria@email.com', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return token for user', async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual({ token: 'jwt-token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
    });
  });
});
