import { FastifyInstance } from 'fastify';
import { TransactionController } from './transaction.controller';
import { jwtAuthMiddleware } from '../../shared/middlewares/jwt-auth.middleware';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  const controller = new TransactionController();

  // GET /balance - Get user balance
  app.get(
    '/balance',
    {
      preHandler: [jwtAuthMiddleware],
      schema: {
        tags: ['Balance'],
        description: 'Get consolidated balance (CREDIT - DEBIT) from materialized user_balances table.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: { type: 'string', format: 'uuid', description: 'User ID from MS-Users' },
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
          429: {
            description: 'Too Many Requests - Rate limit exceeded',
            type: 'object',
            properties: {
              code: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
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
        description: 'Create a new transaction (CREDIT or DEBIT).',
        security: [{ bearerAuth: [] }],
        headers: {
          type: 'object',
          properties: {
            'idempotency-key': {
              type: 'string',
              format: 'uuid',
              description: 'Unique key to ensure idempotent transaction processing',
            },
          },
        },
        body: {
          type: 'object',
          required: ['user_id', 'amount', 'type'],
          properties: {
            user_id: { type: 'string', format: 'uuid', description: 'User ID from MS-Users' },
            amount: { type: 'number', minimum: 1, description: 'Transaction amount (minimum: 1)' },
            type: { type: 'string', enum: ['CREDIT', 'DEBIT'], description: 'CREDIT adds to balance, DEBIT subtracts' },
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
            headers: {
              'x-idempotent-replayed': {
                type: 'string',
                description: 'Present and set to "true" if response was replayed from cache',
              },
            },
          },
          400: {
            description: 'Bad Request - Invalid data or insufficient balance',
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Error code (e.g., INSUFFICIENT_BALANCE, VALIDATION_ERROR)' },
              message: { type: 'string', description: 'Human-readable error message' },
            },
          },
          409: {
            description: 'Conflict - Same idempotency key with different payload',
            type: 'object',
            properties: {
              code: { type: 'string', example: 'IDEMPOTENCY_CONFLICT' },
              message: { type: 'string' },
            },
          },
          429: {
            description: 'Too Many Requests - Rate limit exceeded',
            type: 'object',
            properties: {
              code: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    controller.create.bind(controller)
  );
}