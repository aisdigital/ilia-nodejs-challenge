import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const controller = new UserController();

  // GET /users - List all users
  app.get(
    '/users',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Users'],
        description: 'List all active users',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: 'List of users',
            type: 'array',
            items: {
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
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.list.bind(controller)
  );

  // GET /users/:id - Get user by ID
  app.get(
    '/users/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Users'],
        description: 'Get user by ID',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User ID' },
          },
          required: ['id'],
        },
        response: {
          200: {
            description: 'User found',
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
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            description: 'User not found',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.getById.bind(controller)
  );

  // PUT /users/:id - Update user
  app.put(
    '/users/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Users'],
        description: 'Update user information',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User ID' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
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
          200: {
            description: 'User updated successfully',
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
          400: {
            description: 'Bad Request - Validation error',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            description: 'User not found',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.update.bind(controller)
  );

  // DELETE /users/:id - Soft delete user
  app.delete(
    '/users/:id',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Users'],
        description: 'Soft delete user',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'User ID' },
          },
          required: ['id'],
        },
        response: {
          204: {
            description: 'User deleted successfully',
            type: 'null',
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
          404: {
            description: 'User not found',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.delete.bind(controller)
  );
}
