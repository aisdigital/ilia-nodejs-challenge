import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../../src/modules/user/user.service';
import { User } from '../../src/modules/user/entities/user.entity';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/user/dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUser: User = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'hashed_password',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: any;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: 'WALLET_PACKAGE', useValue: null },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    repository = moduleRef.get(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const userData: CreateUserDto = {
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@email.com',
        password: 'secret',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        }),
      );
      expect(repository.create.mock.calls[0][0].password).toBe('hashed_password');
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const userData: CreateUserDto = {
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@email.com',
        password: 'secret',
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      await expect(service.create(userData)).rejects.toThrow('User with this email already exists');
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('maria@email.com');
      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'maria@email.com' } });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      const result = await service.findOneByEmail('unknown@email.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, first_name: 'João' };

      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);

      const updateData: UpdateUserDto = { first_name: 'João' };

      const result = await service.update('user-1', updateData);

      expect(result.first_name).toBe('João');
      expect(repository.update).toHaveBeenCalledWith({ id: 'user-1' }, updateData);
    });

    it('should hash password when updating with new password', async () => {
      const updatedUser = { ...mockUser, password: 'hashed_password' };
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);

      const updateData: UpdateUserDto = { password: 'newsecret' };
      await service.update('user-1', updateData);

      expect(repository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        expect.objectContaining({ password: 'hashed_password' }),
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({} as any);

      await service.remove('user-1');

      expect(repository.delete).toHaveBeenCalledWith({ id: 'user-1' });
    });
  });
});
