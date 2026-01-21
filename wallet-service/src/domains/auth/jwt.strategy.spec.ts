import { JwtStrategy } from './jwt.strategy';
import { faker } from '@faker-js/faker';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('should return user object with userId and email', async () => {
      const payload = {
        sub: faker.number.int(),
        email: faker.internet.email(),
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: payload.sub,
        email: payload.email,
      });
    });

    it('should return userId even if email is undefined', async () => {
      const payload = {
        sub: faker.number.int(),
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: payload.sub,
        email: undefined,
      });
    });
  });
});
