import { dbConnection } from '@databases';
import { CreateUserDto } from '@dtos/users.dto';
import AuthRoute from '@routes/auth.route';
import UserService from '@services/users.service';
import connection from './connection';

beforeAll(async () => {
  await connection.create(dbConnection);
});

afterAll(async () => {
  await connection.close();
});

beforeEach(async () => {
  await connection.clear();
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
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
});
