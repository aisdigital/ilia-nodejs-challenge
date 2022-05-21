import bcrypt from 'bcrypt';
import request from 'supertest';
import { createConnection, getConnection } from 'typeorm';
import App from '@/app';
import { dbConnection } from '@databases';
import { AuthUserDto } from '@dtos/auth.dto';
import AuthRoute from '@routes/auth.route';
import { UserEntity } from '@entities/users.entity';
import AuthService from '@services/auth.service';

beforeAll(async () => {
  await createConnection(dbConnection);
});

afterAll(async () => {
  await getConnection().close();
});

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    it('response should have the Create userData', async () => {
      const authService = new AuthService();

      const userData: AuthUserDto = {
        email: 'test@email.com',
        password: 'q1w2e3r4!',
      };

      await authService.login(userData);
      const { token, findUser } = await authService.login(userData);

      expect(token).not.toBeUndefined();
      expect(findUser).not.toBeUndefined();
      expect(findUser.email).toBe(userData.email);
    });
  });
});
