import { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';
import { sequelize } from '../../config/database';
import { Transaction, TransactionType } from '../transaction.model';

describe('Transaction Integration Tests', () => {
  let app: FastifyInstance;
  const userId = '123e4567-e89b-12d3-a456-426614174000';

  beforeAll(async () => {
    try {
      app = await buildApp({ logger: false });
      
      await sequelize.sync({ force: true });
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
    await Transaction.destroy({ where: {}, truncate: true });
  });

  describe('POST /transactions', () => {
    it('should return 201 and create a CREDIT transaction', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 100,
          type: 'CREDIT',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.user_id).toBe(userId);
      expect(body.amount).toBe(100);
      expect(body.type).toBe('CREDIT');
      expect(body).toHaveProperty('created_at');
      expect(body).toHaveProperty('updated_at');
    });

    it('should return 201 and create a DEBIT transaction when balance is sufficient', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 200,
        type: TransactionType.CREDIT,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 50,
          type: 'DEBIT',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body.type).toBe('DEBIT');
      expect(body.amount).toBe(50);
    });

    it('should return 400 when insufficient balance for DEBIT', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 150,
          type: 'DEBIT',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INSUFFICIENT_BALANCE');
      expect(body).toHaveProperty('message');
    });

    it('should return 400 when trying to DEBIT with zero balance', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 10,
          type: 'DEBIT',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBe('INSUFFICIENT_BALANCE');
    });

    it('should return 400 when user_id is not a valid UUID', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: 'invalid-uuid',
          amount: 100,
          type: 'CREDIT',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(['VALIDATION_ERROR', 'FST_ERR_VALIDATION']).toContain(body.code);
    });

    it('should return 400 when amount is zero', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 0,
          type: 'CREDIT',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(['VALIDATION_ERROR', 'FST_ERR_VALIDATION']).toContain(body.code);
    });

    it('should return 400 when type is invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 100,
          type: 'INVALID_TYPE',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(['VALIDATION_ERROR', 'FST_ERR_VALIDATION']).toContain(body.code);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should allow DEBIT when balance equals amount', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 100,
          type: 'DEBIT',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(100);
      expect(body.type).toBe('DEBIT');
    });

    it('should handle multiple CREDIT and DEBIT transactions correctly', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 50,
        type: TransactionType.CREDIT,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 75,
          type: 'DEBIT',
        },
      });

      expect(response.statusCode).toBe(201);
      
      const response2 = await app.inject({
        method: 'POST',
        url: '/transactions',
        payload: {
          user_id: userId,
          amount: 100,
          type: 'DEBIT',
        },
      });

      expect(response2.statusCode).toBe(400);
      const body = JSON.parse(response2.body);
      expect(body.code).toBe('INSUFFICIENT_BALANCE');
    });
  });
});