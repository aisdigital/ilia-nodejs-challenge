import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Express, Request, Response } from 'express';
import { validate } from '../src/middleware/validate';
import { registerSchema, loginSchema, RegisterInput, LoginInput } from '../src/schemas/auth.schema';
import { hashPassword, comparePasswords } from '../src/lib/password';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const createApp = (): Express => {
  const app = express();
  app.use(express.json());

  const mockUsers: Record<string, any> = {};

  app.post('/auth/register', validate(registerSchema), async (req: Request, res: Response) => {
    try {
      const validatedData = req.body as RegisterInput;

      if (mockUsers[validatedData.email]) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const hashedPassword = await hashPassword(validatedData.password);

      const user = {
        id: `user-${Date.now()}`,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      };

      mockUsers[validatedData.email] = user;

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  app.post('/auth/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
      const validatedData = req.body as LoginInput;

      const user = mockUsers[validatedData.email];

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const passwordMatch = await comparePasswords(validatedData.password, user.password);

      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  return app;
};

describe('User Service - Authentication', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'john.doe@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'john.doe@example.com');
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      const registerData = {
        email: 'john.doe@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app).post('/auth/register').send(registerData);

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });

    it('should reject invalid email', async () => {
      const registerData = {
        email: 'invalid-email',
        password: 'securepassword123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject short password', async () => {
      const registerData = {
        email: 'jane@example.com',
        password: 'short',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registerData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123456',
          firstName: 'User',
          lastName: 'Test',
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123456',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'user@example.com');
      expect(response.body).toHaveProperty('token');
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123456',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });
});
