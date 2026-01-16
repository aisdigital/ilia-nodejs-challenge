import { GetUser } from './GetUser';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserNotFoundError } from '../../domain/errors';

describe('GetUser Use Case', () => {
  let getUser: GetUser;
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

    getUser = new GetUser(mockRepository);

    jest.clearAllMocks();
  });

  it('should get user by id successfully', async () => {
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

    const result = await getUser.execute({ id: '123' });

    expect(result).toEqual(mockUser);
    expect(mockRepository.findById).toHaveBeenCalledWith('123');
  });

  it('should throw error when user is not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(getUser.execute({ id: 'nonexistent' })).rejects.toThrow(UserNotFoundError);
  });
});
