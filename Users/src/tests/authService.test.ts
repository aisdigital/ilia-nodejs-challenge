import { dbConnection } from '@databases';
import { AuthUserDto } from '@dtos/auth.dto';
import AuthService from '@services/auth.service';
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
