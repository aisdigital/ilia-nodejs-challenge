import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Express, Request, Response, NextFunction } from 'express';
import { validate } from '../../src/middleware/validate';
import { createTransactionSchema } from '../../src/schemas/transaction.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const createTestApp = (): Express => {
  const app = express();

  app.use(express.json());

  const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Missing authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }

    try {
      (req as any).user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  app.post(
    '/transactions',
    authenticate,
    validate(createTransactionSchema),
    async (req: Request, res: Response) => {
      res.status(201).json({ success: true, data: req.body });
    }
  );

  return app;
};

describe('Zod Validation Middleware', () => {
  let app: Express;
  let validToken: string;

  beforeAll(() => {
    app = createTestApp();
    validToken = jwt.sign({ id: '550e8400-e29b-41d4-a716-446655440000' }, JWT_SECRET);
  });

  describe('POST /transactions - Validation', () => {
    it('should accept valid transaction data', async () => {
      const validData = {
        user_id: VALID_USER_ID,
        amount: 100,
        type: 'CREDIT',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('amount', 100);
      expect(response.body.data).toHaveProperty('type', 'CREDIT');
    });

    it('should reject missing amount', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        type: 'CREDIT',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid amount (negative)', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        amount: -50,
        type: 'CREDIT',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid type', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        amount: 100,
        type: 'INVALID',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject non-integer amount', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        amount: 100.5,
        type: 'DEBIT',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject amount of zero', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        amount: 0,
        type: 'CREDIT',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject extra fields in body', async () => {
      const invalidData = {
        user_id: VALID_USER_ID,
        amount: 100,
        type: 'CREDIT',
        extraField: 'should-not-exist',
      };

      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
