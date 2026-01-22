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

  describe('GET /transactions', () => {
    it('should return 200 and list all transactions for a user', async () => {
      // Create test transactions
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 50,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/transactions?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
      expect(body[0].amount).toBe(50); 
      expect(body[1].amount).toBe(100);
    });

    it('should filter transactions by type CREDIT', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 50,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/transactions?user_id=${userId}&type=CREDIT`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(1);
      expect(body[0].type).toBe('CREDIT');
      expect(body[0].amount).toBe(100);
    });

    it('should filter transactions by type DEBIT', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 30,
        type: TransactionType.DEBIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 20,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/transactions?user_id=${userId}&type=DEBIT`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(2);
      expect(body[0].type).toBe('DEBIT');
      expect(body[1].type).toBe('DEBIT');
    });

    it('should return empty array when no transactions found', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/transactions?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(0);
    });

    it('should return 400 when user_id is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/transactions',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBeDefined();
    });

    it('should return 400 when user_id is invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/transactions?user_id=invalid-uuid',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return transactions ordered by created_at DESC', async () => {
      // Create transactions with slight delays to ensure different timestamps
      const tx1 = await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const tx2 = await Transaction.create({
        user_id: userId,
        amount: 50,
        type: TransactionType.CREDIT,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const tx3 = await Transaction.create({
        user_id: userId,
        amount: 25,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/transactions?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveLength(3);
      expect(body[0].id).toBe(tx3.id);
      expect(body[1].id).toBe(tx2.id);
      expect(body[2].id).toBe(tx1.id);
    });
  });

  describe('GET /balance', () => {
    it('should return 200 and balance zero when no transactions exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('amount');
      expect(body.amount).toBe(0);
    });

    it('should return correct balance with only CREDIT transactions', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 50.50,
        type: TransactionType.CREDIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(150.50);
    });

    it('should return correct balance with CREDIT and DEBIT transactions', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 200,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 75.25,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(124.75); // 200 - 75.25
    });

    it('should return zero balance when CREDIT equals DEBIT', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 100,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(0);
    });

    it('should handle multiple transactions correctly', async () => {
      // Multiple CREDITS
      await Transaction.create({ user_id: userId, amount: 100, type: TransactionType.CREDIT });
      await Transaction.create({ user_id: userId, amount: 200, type: TransactionType.CREDIT });
      await Transaction.create({ user_id: userId, amount: 150, type: TransactionType.CREDIT });
      
      // Multiple DEBITS
      await Transaction.create({ user_id: userId, amount: 50, type: TransactionType.DEBIT });
      await Transaction.create({ user_id: userId, amount: 75, type: TransactionType.DEBIT });

      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(325); // (100 + 200 + 150) - (50 + 75)
    });

    it('should return 400 when user_id is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/balance',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.code).toBeDefined();
    });

    it('should return 400 when user_id is invalid UUID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/balance?user_id=invalid-uuid',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return different balances for different users', async () => {
      const userId2 = '550e8400-e29b-41d4-a716-446655440000';

      // User 1 transactions
      await Transaction.create({ user_id: userId, amount: 100, type: TransactionType.CREDIT });
      
      // User 2 transactions
      await Transaction.create({ user_id: userId2, amount: 500, type: TransactionType.CREDIT });

      const response1 = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      const response2 = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId2}`,
      });

      expect(response1.statusCode).toBe(200);
      expect(response2.statusCode).toBe(200);
      
      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);
      
      expect(body1.amount).toBe(100);
      expect(body2.amount).toBe(500);
    });

    it('should handle decimal amounts correctly', async () => {
      await Transaction.create({
        user_id: userId,
        amount: 99.99,
        type: TransactionType.CREDIT,
      });

      await Transaction.create({
        user_id: userId,
        amount: 25.50,
        type: TransactionType.DEBIT,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/balance?user_id=${userId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.amount).toBe(74.49); // 99.99 - 25.50
    });
  });
});