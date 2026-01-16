import { LoginUser } from './LoginUser';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { InvalidCredentialsError } from '../../domain/errors';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('LoginUser Use Case', () => {
  let loginUser: LoginUser;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    loginUser = new LoginUser(mockRepository);

    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await loginUser.execute({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result.user).toEqual(mockUser);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
  });

  it('should throw error when user does not exist', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUser.execute({
        email: 'notfound@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(InvalidCredentialsError);

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should throw error when password is invalid', async () => {
    const mockUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      loginUser.execute({
        email: 'john@example.com',
        password: 'wrongpassword',
      })
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
