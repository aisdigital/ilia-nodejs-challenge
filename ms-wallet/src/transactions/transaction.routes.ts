import { FastifyInstance } from 'fastify';
import { TransactionController } from './transaction.controller';
import { jwtAuthMiddleware } from '../shared/middlewares/jwt-auth.middleware';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  const controller = new TransactionController();

  // GET /balance - Get user balance
  app.get(
    '/balance',
    {
      preHandler: [jwtAuthMiddleware],
      schema: {
        tags: ['Transactions'],
        description: 'Get consolidated balance (CREDIT - DEBIT)',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: { type: 'string', format: 'uuid', description: 'User ID' },
          },
        },
        response: {
          200: {
            description: 'Current balance',
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Current balance (CREDIT - DEBIT)' },
            },
          },
          400: {
            description: 'Bad Request - Invalid parameters',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.getBalance.bind(controller)
  );

  // GET /transactions - List transactions
  app.get(
    '/transactions',
    {
      preHandler: [jwtAuthMiddleware],
      schema: {
        tags: ['Transactions'],
        description: 'List all transactions for a user',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: { type: 'string', format: 'uuid', description: 'User ID' },
            type: { 
              type: 'string', 
              enum: ['CREDIT', 'DEBIT'],
              description: 'Filter by transaction type (optional)'
            },
          },
        },
        response: {
          200: {
            description: 'List of transactions',
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                amount: { type: 'number' },
                type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
          },
          400: {
            description: 'Bad Request - Invalid parameters',
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

  // POST /transactions - Create transaction
  app.post(
    '/transactions',
    {
      preHandler: [jwtAuthMiddleware],
      schema: {
        tags: ['Transactions'],
        description: 'Create a new transaction (CREDIT or DEBIT)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['user_id', 'amount', 'type'],
          properties: {
            user_id: { type: 'string', format: 'uuid' },
            amount: { type: 'number', minimum: 1 },
            type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
          },
        },
        response: {
          201: {
            description: 'Transaction created successfully',
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              user_id: { type: 'string', format: 'uuid' },
              amount: { type: 'number' },
              type: { type: 'string', enum: ['CREDIT', 'DEBIT'] },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            description: 'Bad Request - Invalid data or insufficient balance',
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.create.bind(controller)
  );
}