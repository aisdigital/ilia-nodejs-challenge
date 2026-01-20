import { FastifyInstance } from 'fastify';
import { TransactionController } from './transaction.controller';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  const controller = new TransactionController();

  // POST /transactions - Create transaction
  app.post(
    '/transactions',
    {
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