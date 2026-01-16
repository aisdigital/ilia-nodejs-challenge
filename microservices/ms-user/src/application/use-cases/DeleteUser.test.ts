import { DeleteUser } from './DeleteUser';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserNotFoundError } from '../../domain/errors';

describe('DeleteUser Use Case', () => {
  let deleteUser: DeleteUser;
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

    deleteUser = new DeleteUser(mockRepository);

    jest.clearAllMocks();
  });

  it('should delete user successfully', async () => {
    const mockUser = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockRepository.findById.mockResolvedValue(mockUser);
    mockRepository.delete.mockResolvedValue(undefined);

    await deleteUser.execute({ id: '123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('123');
    expect(mockRepository.delete).toHaveBeenCalledWith('123');
  });

  it('should throw error when user does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(deleteUser.execute({ id: 'nonexistent' })).rejects.toThrow(UserNotFoundError);

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
