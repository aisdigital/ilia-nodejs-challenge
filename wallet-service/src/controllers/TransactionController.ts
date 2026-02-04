import { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import { CreateTransactionInput } from '../schemas/transaction.schema';

export class TransactionController {
  private service: TransactionService;

  constructor() {
    this.service = new TransactionService();
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = req.body as CreateTransactionInput;
      const userId = validatedData.user_id;

      if (!userId) {
        res.status(400).json({ error: 'Missing user_id in request body' });
        return;
      }

      const transaction = await this.service.createTransaction(userId, validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof Error && error.message.includes('exceeds maximum')) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
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

      const transactions = await this.service.listTransactions(userId, typeFilter);
      res.status(200).json({ transactions });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.user_id as string | undefined;

      if (!userId) {
        res.status(400).json({ error: 'Missing user_id in query parameters' });
        return;
      }

      const balance = await this.service.calculateBalance(userId);

      res.status(200).json(balance);
    } catch (error) {
      console.error('Error calculating balance:', error);
      res.status(500).json({ error: 'Failed to calculate balance' });
    }
  }
}
