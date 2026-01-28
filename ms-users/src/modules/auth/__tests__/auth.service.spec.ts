import argon2 from 'argon2';
import { AuthService } from '../auth.service';
import { IUserRepository } from '../../users/user.repository.interface';
import { User } from '../../users/user.model';
import {
  DuplicateEmailError,
  InvalidCredentialsError,
  UserAlreadyDeletedException,
} from '../../../shared/errors/app-error';
import { CreateUserDTO, LoginDTO } from '../../users/user.schema';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockGenerateToken: jest.Mock;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    mockGenerateToken = jest.fn();
    service = new AuthService(mockRepository, mockGenerateToken);
  });

  describe('register', () => {
    const registerData: CreateUserDTO = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: registerData.email,
        password: hashedPassword,
        name: registerData.name,
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockRepository.findByEmail.mockResolvedValue(null);
      (argon2.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockRepository.create.mockResolvedValue(mockUser);
      mockGenerateToken.mockReturnValue('jwt_token');

      const result = await service.register(registerData);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(registerData.email, true);
      expect(argon2.hash).toHaveBeenCalledWith(registerData.password);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...registerData,
        password: hashedPassword,
      });
      expect(mockGenerateToken).toHaveBeenCalledWith({ user_id: mockUser.id });
      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at,
          deleted_at: null,
        },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw DuplicateEmailError when email already exists', async () => {
      const existingUser = {
        id: '123',
        email: registerData.email,
        deleted_at: null,
      } as User;

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerData)).rejects.toThrow(DuplicateEmailError);
      expect(argon2.hash).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw UserAlreadyDeletedException when email belongs to deleted user', async () => {
      const deletedUser = {
        id: '123',
        email: registerData.email,
        deleted_at: new Date(),
      } as User;

      mockRepository.findByEmail.mockResolvedValue(deletedUser);

      await expect(service.register(registerData)).rejects.toThrow(UserAlreadyDeletedException);
    });
  });

  describe('login', () => {
    const loginData: LoginDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: loginData.email,
        password: hashedPassword,
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockGenerateToken.mockReturnValue('jwt_token');

      const result = await service.login(loginData);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(loginData.email, false);
      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, loginData.password);
      expect(mockGenerateToken).toHaveBeenCalledWith({ user_id: mockUser.id });
      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          created_at: mockUser.created_at,
          updated_at: mockUser.updated_at,
          deleted_at: null,
        },
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw InvalidCredentialsError when user does not exist', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginData)).rejects.toThrow(InvalidCredentialsError);
      expect(argon2.verify).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      const mockUser = {
        id: '123',
        email: loginData.email,
        password: 'hashed_password',
        deleted_at: null,
      } as User;

      mockRepository.findByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginData)).rejects.toThrow(InvalidCredentialsError);
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it('should not allow login for deleted users', async () => {
      mockRepository.findByEmail.mockResolvedValue(null); 

      await expect(service.login(loginData)).rejects.toThrow(InvalidCredentialsError);
    });
  });
});
