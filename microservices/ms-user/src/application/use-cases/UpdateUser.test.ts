import { UpdateUser } from './UpdateUser';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserNotFoundError } from '../../domain/errors';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UpdateUser Use Case', () => {
  let updateUser: UpdateUser;
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

    updateUser = new UpdateUser(mockRepository);

    jest.clearAllMocks();
  });

  it('should update user successfully', async () => {
    const existingUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedUser = new User({
      id: '123',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findById.mockResolvedValue(existingUser);
    mockRepository.update.mockResolvedValue(updatedUser);

    const result = await updateUser.execute({
      id: '123',
      firstName: 'Jane',
      lastName: 'Smith',
    });

    expect(result).toEqual(updatedUser);
    expect(mockRepository.findById).toHaveBeenCalledWith('123');
    expect(mockRepository.update).toHaveBeenCalledWith('123', {
      firstName: 'Jane',
      lastName: 'Smith',
    });
  });

  it('should update password with hashing', async () => {
    const existingUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'oldhashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedUser = new User({
      ...existingUser,
      password: 'newhashedpassword',
    });

    mockRepository.findById.mockResolvedValue(existingUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
    mockRepository.update.mockResolvedValue(updatedUser);

    expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    expect(mockRepository.update).toHaveBeenCalledWith('123', {
      password: 'newhashedpassword',
    });
  });

  it('should throw error when user does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      updateUser.execute({
        id: 'nonexistent',
        firstName: 'Jane',
      })
    ).rejects.toThrow(UserNotFoundError);

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should update only provided fields', async () => {
    const existingUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findById.mockResolvedValue(existingUser);
    mockRepository.update.mockResolvedValue(existingUser);

    await updateUser.execute({
      id: '123',
      firstName: 'Jane',
    });

    expect(mockRepository.update).toHaveBeenCalledWith('123', {
      firstName: 'Jane',
    });
  });
});
