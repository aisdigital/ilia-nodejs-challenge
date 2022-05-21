import { dbConnection } from '@databases';
import { CreateUserDto } from '@dtos/users.dto';
import UserService from '@services/users.service';
import connection from './connection';

beforeAll(async () => {
  await connection.create(dbConnection);
  await connection.clear();
});

afterAll(async () => {
  await connection.close();
});

beforeEach(async () => {
  // await connection.clear();
});

describe('Testing User Service', () => {
  describe('create user', () => {
    it('response should have the Create userData', async () => {
      const usersService = new UserService();

      const userData: CreateUserDto = {
        first_name: 'User',
        last_name: 'Admin',
        password: 'user_admin',
        email: 'user.admissna@email.com',
        id: 'asdfa-123213-asd-fffd-2',
      };

      const user = await usersService.createUser(userData);

      expect(user).not.toBeUndefined();
      expect(user.email).toBe(userData.email);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.last_name).toBe(userData.last_name);
      expect(user.id).toBe(userData.id);
    });
  });

  describe('patch user', () => {
    it('change partial entity', async () => {
      const usersService = new UserService();

      const id = 'asdfa-123213-asd-fffd-2qq';
      const newUser: CreateUserDto = {
        first_name: 'User',
        last_name: 'Admin',
        password: 'user_admin',
        email: 'user.admisszzna@email.com',
        id: id,
      };
      await usersService.createUser(newUser);

      const userData: any = {
        first_name: 'zxcvzxcvzxcv',
        id: 'zzzzzzz',
      };
      const user = await usersService.patchUser(id, userData);

      expect(user).not.toBeUndefined();
      expect(user.first_name).not.toBe(newUser.first_name);
      expect(user.first_name).toBe(userData.first_name);
      expect(user.id).toBe(id);
    });
  });

  describe('get user', () => {
    it('get by id', async () => {
      const usersService = new UserService();

      const id = 'zxcv';
      const newUser: CreateUserDto = {
        first_name: 'User',
        last_name: 'Admin',
        password: 'user_admin',
        email: 'user.admissnzxca@email.com',
        id: id,
      };
      await usersService.createUser(newUser);

      const user = await usersService.findUserById(id);

      expect(user).not.toBeUndefined();
      expect(user.first_name).toBe(newUser.first_name);
      expect(user.last_name).toBe(newUser.last_name);
      expect(user.email).toBe(newUser.email);
      expect(user.id).toBe(id);
    });
  });
});
