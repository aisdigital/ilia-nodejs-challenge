import { RegisterUser } from './RegisterUser';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { DuplicateEmailError } from '../../domain/errors';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('RegisterUser Use Case', () => {
  let registerUser: RegisterUser;
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

    registerUser = new RegisterUser(mockRepository);

    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const mockUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    mockRepository.create.mockResolvedValue(mockUser);

    const result = await registerUser.execute({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockUser);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockRepository.create).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
    });
  });

  it('should throw error when email already exists', async () => {
    const existingUser = new User({
      id: '123',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      registerUser.execute({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      })
    ).rejects.toThrow(DuplicateEmailError);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
