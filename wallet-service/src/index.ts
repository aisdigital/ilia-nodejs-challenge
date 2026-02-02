import express, { Express, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import { TransactionType } from '@prisma/client';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ILIACHALLENGE';

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
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * POST /transactions
 * Creates a new transaction for the authenticated user
 */
app.post('/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const { user_id, type, amount } = req.body;
    const userId = (req as any).user?.id || user_id;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!type || !['CREDIT', 'DEBIT'].includes(type)) {
      res.status(400).json({ error: 'Type must be CREDIT or DEBIT' });
      return;
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: type as TransactionType,
        amount: Math.round(amount),
      },
    });

    res.status(200).json({
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

/**
 * GET /transactions
 * Retrieves transactions for the authenticated user
 */
app.get('/transactions', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const typeFilter = req.query.type as string | undefined;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const where: any = { userId };

    if (typeFilter) {
      if (!['CREDIT', 'DEBIT'].includes(typeFilter)) {
        res.status(400).json({ error: 'Type must be CREDIT or DEBIT' });
        return;
      }
      where.type = typeFilter;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const response = transactions.map((tx) => ({
      id: tx.id,
      user_id: tx.userId,
      type: tx.type,
      amount: tx.amount,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /balance
 * Calculates balance as sum of CREDIT transactions minus DEBIT transactions
 */
app.get('/balance', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const creditResult = await prisma.transaction.aggregate({
      where: { userId, type: 'CREDIT' },
      _sum: { amount: true },
    });

    const debitResult = await prisma.transaction.aggregate({
      where: { userId, type: 'DEBIT' },
      _sum: { amount: true },
    });

    const creditSum = creditResult._sum.amount || 0;
    const debitSum = debitResult._sum.amount || 0;
    const balance = creditSum - debitSum;

    res.status(200).json({ amount: balance });
  } catch (error) {
    console.error('Error calculating balance:', error);
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Wallet Microservice running on port ${PORT}`);
});
