import { User } from './User';

describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(user.id).toBe('123');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should convert to JSON format with snake_case', () => {
    const user = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const json = user.toJSON();

    expect(json).toEqual({
      id: '123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    });
  });

  it('should not expose password in JSON', () => {
    const user = new User({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const json = user.toJSON();

    expect(json).not.toHaveProperty('password');
  });
});
