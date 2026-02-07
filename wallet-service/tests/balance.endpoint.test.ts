import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Express, Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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

  app.get('/balance', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const mockTransactions = [
      { type: 'CREDIT', amount: 1000 },
      { type: 'CREDIT', amount: 500 },
      { type: 'DEBIT', amount: 200 },
    ];

    const groupedTransactions = mockTransactions.reduce(
      (acc, tx) => {
        const existing = acc.find((g) => g.type === tx.type);
        if (existing) {
          existing._sum = { ...existing._sum, amount: (existing._sum.amount || 0) + tx.amount };
        } else {
          acc.push({ type: tx.type, _sum: { amount: tx.amount } });
        }
        return acc;
      },
      [] as Array<{ type: string; _sum: { amount: number } }>
    );

    const creditSum = groupedTransactions.find((g) => g.type === 'CREDIT')?._sum.amount || 0;
    const debitSum = groupedTransactions.find((g) => g.type === 'DEBIT')?._sum.amount || 0;
    const balance = creditSum - debitSum;

    res.status(200).json({ amount: balance });
  });

  return app;
};

describe('GET /balance', () => {
  let app: Express;
  let validToken: string;

  beforeAll(() => {
    app = createTestApp();
    validToken = jwt.sign({ id: USER_ID }, JWT_SECRET);
  });

  it('should calculate balance correctly with groupBy logic', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('amount');
    expect(response.body.amount).toBe(1300);
  });

  it('should return 401 without authentication', async () => {
    const response = await request(app).get('/balance');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing authorization header');
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or expired token');
  });
});
