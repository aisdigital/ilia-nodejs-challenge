import { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';
import { sequelize } from '../../config/database';
import { User } from '../user.model';
import argon2 from 'argon2';

describe('User Integration Tests', () => {
  let app: FastifyInstance;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    try {
      app = await buildApp({ logger: false });
      await sequelize.sync({ force: true });

      // Create a test user and get auth token
      const hashedPassword = await argon2.hash('password123');
      const user = await User.create({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
      });
      testUserId = user.id;

      // Generate token
      authToken = app.jwt.sign({ user_id: user.id });
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (sequelize) {
        await sequelize.close();
      }
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Failed to cleanup test environment:', error);
    }
  });

  beforeEach(async () => {
    // Clear users except the test user
    await User.destroy({
      where: {},
      force: true,
    });

    // Recreate test user
    const hashedPassword = await argon2.hash('password123');
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    });
    testUserId = user.id;
    authToken = app.jwt.sign({ user_id: user.id });
  });

  describe('GET /users', () => {
    it('should return 200 and list all active users', async () => {
      // Create additional users
      const hashedPassword = await argon2.hash('password123');
      await User.create({
        email: 'user2@example.com',
        password: hashedPassword,
        name: 'User Two',
      });

      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(2);
      expect(body[0]).not.toHaveProperty('password');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: {
          authorization: 'Bearer invalid_token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return 200 and get user by id', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(testUserId);
      expect(body.email).toBe('test@example.com');
      expect(body.name).toBe('Test User');
      expect(body).not.toHaveProperty('password');
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const response = await app.inject({
        method: 'GET',
        url: `/users/${nonExistentId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/users/${testUserId}`,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('PUT /users/:id', () => {
    it('should return 200 and update user name', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.name).toBe('Updated Name');
      expect(body.email).toBe('test@example.com');
      expect(body).not.toHaveProperty('password');
    });

    it('should return 200 and update user password', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          password: 'newpassword123',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).not.toHaveProperty('password');

      // Verify password was updated by trying to login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'newpassword123',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
    });

    it('should return 200 and update user email', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          email: 'newemail@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.email).toBe('newemail@example.com');
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${nonExistentId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 when email is invalid', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          email: 'invalid-email',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when password is too short', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          password: '123',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 when name is too short', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          name: 'A',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 204 and soft delete user', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(204);

      // Verify user was soft deleted
      const user = await User.findByPk(testUserId);
      expect(user).not.toBeNull();
      expect(user?.deleted_at).not.toBeNull();
    });

    it('should return 404 when user does not exist', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174999';
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${nonExistentId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${testUserId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it('should not allow login after user is deleted', async () => {
      // Delete user
      await app.inject({
        method: 'DELETE',
        url: `/users/${testUserId}`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      // Try to login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(loginResponse.statusCode).toBe(401);
    });
  });
});
