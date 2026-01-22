import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const controller = new AuthController((payload) => app.jwt.sign(payload));

  // POST /auth/register - Register new user
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['Authentication'],
        description: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { 
              type: 'string', 
              minLength: 6,
              description: 'User password (minimum 6 characters)' 
            },
            name: { 
              type: 'string', 
              minLength: 2,
              description: 'User full name' 
            },
          },
        },
        response: {
          201: {
            description: 'User registered successfully',
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT token' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                  deleted_at: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
          400: {
            description: 'Bad Request - Validation error',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          409: {
            description: 'Conflict - Email already exists',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.register.bind(controller)
  );

  // POST /auth/login - User login
  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Authentication'],
        description: 'Authenticate user and get JWT token',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', description: 'User email' },
            password: { type: 'string', description: 'User password' },
          },
        },
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT token' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string', format: 'email' },
                  name: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                  deleted_at: { type: 'string', format: 'date-time', nullable: true },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid credentials',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.login.bind(controller)
  );
}
