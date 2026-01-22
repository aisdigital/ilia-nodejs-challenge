import argon2 from 'argon2';
import { UserService } from '../user.service';
import { IUserRepository } from '../user.repository.interface';
import { User } from '../user.model';
import { UserNotFoundError } from '../../shared/errors/app-error';
import { UpdateUserDTO } from '../user.schema';

jest.mock('argon2');

describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    service = new UserService(mockRepository);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active users without password', async () => {
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user1@example.com',
          password: 'hashed_password_1',
          name: 'User One',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as User,
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          email: 'user2@example.com',
          password: 'hashed_password_2',
          name: 'User Two',
          deleted_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        } as User,
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith(false);
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return user by id without password', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(userId);
      expect(result.email).toBe('test@example.com');
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(userId)).rejects.toThrow(UserNotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
    });
  });

  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should update user without changing password', async () => {
      const updateData: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      } as User;

      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result.name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password');
      expect(argon2.hash).not.toHaveBeenCalled();
    });

    it('should update user and hash new password', async () => {
      const updateData: UpdateUserDTO = {
        name: 'Updated Name',
        password: 'new_password',
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'old_hashed_password',
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        password: 'new_hashed_password',
      } as User;

      mockRepository.findById.mockResolvedValue(mockUser);
      (argon2.hash as jest.Mock).mockResolvedValue('new_hashed_password');
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(argon2.hash).toHaveBeenCalledWith('new_password');
      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        name: 'Updated Name',
        password: 'new_hashed_password',
      });
      expect(result.name).toBe('Updated Name');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const updateData: UpdateUserDTO = {
        name: 'Updated Name',
      };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(userId, updateData)).rejects.toThrow(UserNotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UserNotFoundError when update returns null', async () => {
      const updateData: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue(null as any);

      await expect(service.update(userId, updateData)).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('delete', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should soft delete user successfully', async () => {
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        deleted_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;

      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await service.delete(userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(userId)).rejects.toThrow(UserNotFoundError);
      expect(mockRepository.findById).toHaveBeenCalledWith(userId, false);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
