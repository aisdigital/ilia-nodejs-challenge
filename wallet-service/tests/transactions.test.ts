import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import { Express, Request, Response, NextFunction } from 'express';
import prisma from '../src/lib/prisma';
import { validate } from '../src/middleware/validate';
import { createTransactionSchema, CreateTransactionInput } from '../src/schemas/transaction.schema';

const INTERNAL_JWT_SECRET = 'ILIACHALLENGE_INTERNAL';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const createApp = (): Express => {
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
      jwt.verify(token, INTERNAL_JWT_SECRET);
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired internal token' });
    }
  };

  app.post('/transactions', authenticate, validate(createTransactionSchema), async (req: Request, res: Response) => {
    try {
      const validatedData = req.body as CreateTransactionInput;
      const userId = validatedData.user_id;

      if (!userId) {
        res.status(400).json({ error: 'Missing user_id in request body' });
        return;
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: validatedData.type,
          amount: validatedData.amount,
        },
      });

      res.status(201).json({
        id: transaction.id,
        user_id: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  app.get('/transactions', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.query.user_id as string | undefined;
      const typeFilter = req.query.type as string | undefined;

      if (!userId) {
        res.status(400).json({ error: 'Missing user_id in query parameters' });
        return;
      }

      if (typeFilter && !['CREDIT', 'DEBIT'].includes(typeFilter)) {
        res.status(400).json({ error: 'Type must be CREDIT or DEBIT' });
        return;
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          ...(typeFilter && { type: typeFilter as 'CREDIT' | 'DEBIT' }),
        },
      });

      res.status(200).json({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/balance', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.query.user_id as string | undefined;

      if (!userId) {
        res.status(400).json({ error: 'Missing user_id in query parameters' });
        return;
      }

      const groupedTransactions = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
      });

      const creditSum = groupedTransactions
        .find((group) => group.type === 'CREDIT')?._sum.amount || 0;
      const debitSum = groupedTransactions.find((group) => group.type === 'DEBIT')?._sum.amount || 0;

      res.status(200).json({ amount: creditSum - debitSum });
    } catch (error) {
      console.error('Error calculating balance:', error);
      res.status(500).json({ error: 'Failed to calculate balance' });
    }
  });

  return app;
};

describe('Wallet Transactions Endpoint Integration', () => {
  let app: Express;
  let validToken: string;

  beforeAll(() => {
    app = createApp();
    validToken = jwt.sign({ internal: true }, INTERNAL_JWT_SECRET, { expiresIn: '5m' });
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany({
      where: { userId: USER_ID },
    });
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({
      where: { userId: USER_ID },
    });
    await prisma.$disconnect();
  });

  it('should create transactions and calculate balance correctly', async () => {
    const creditResponse1 = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ user_id: USER_ID, amount: 1000, type: 'CREDIT' });

    expect(creditResponse1.status).toBe(201);
    expect(creditResponse1.body).toHaveProperty('id');
    expect(creditResponse1.body.amount).toBe(1000);
    expect(creditResponse1.body.type).toBe('CREDIT');
    expect(creditResponse1.body.user_id).toBe(USER_ID);

    const creditResponse2 = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ user_id: USER_ID, amount: 1000, type: 'CREDIT' });

    expect(creditResponse2.status).toBe(201);
    expect(creditResponse2.body.amount).toBe(1000);
    expect(creditResponse2.body.type).toBe('CREDIT');

    const debitResponse = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ user_id: USER_ID, amount: 500, type: 'DEBIT' });

    expect(debitResponse.status).toBe(201);
    expect(debitResponse.body.amount).toBe(500);
    expect(debitResponse.body.type).toBe('DEBIT');

    const balanceResponse = await request(app)
      .get('/balance')
      .set('Authorization', `Bearer ${validToken}`)
      .query({ user_id: USER_ID });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body.amount).toBe(1500);
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', 'Bearer invalid_token')
      .query({ user_id: USER_ID });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired internal token');
  });

  it('should return 400 if user_id is missing in POST /transactions', async () => {
    const response = await request(app)
      .post('/transactions')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ amount: 100, type: 'CREDIT' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 if user_id is missing in GET /balance', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should return 400 if user_id is missing in GET /transactions', async () => {
    const response = await request(app)
      .get('/transactions')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
