import { UserController } from '../../src/modules/user/user.controller';
import { User } from '../../src/modules/user/entities/user.entity';
import { CreateUserDto } from '../../src/modules/user/dto/create-user.dto';
import { UpdateUserDto } from '../../src/modules/user/dto/update-user.dto';

const mockUser: User = {
  id: 'user-1',
  first_name: 'Maria',
  last_name: 'Silva',
  email: 'maria@email.com',
  password: 'hashed_password',
  created_at: new Date(),
  updated_at: new Date(),
};

class MockUserService {
  create = jest.fn().mockResolvedValue(mockUser);
  findAll = jest.fn().mockResolvedValue([mockUser]);
  findOne = jest.fn().mockResolvedValue(mockUser);
  update = jest.fn().mockResolvedValue({ ...mockUser, first_name: 'João' });
  remove = jest.fn().mockResolvedValue(undefined);
}

describe('UserController', () => {
  let controller: UserController;
  let service: MockUserService;

  beforeEach(() => {
    service = new MockUserService();
    controller = new UserController(service as any);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const userData: CreateUserDto = {
        first_name: 'Maria',
        last_name: 'Silva',
        email: 'maria@email.com',
        password: 'secret',
      };

      const result = await controller.create(userData);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateData: UpdateUserDto = { first_name: 'João' };

      const result = await controller.update('user-1', updateData);

      expect(result.first_name).toBe('João');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await controller.remove('user-1');
    });
  });
});
