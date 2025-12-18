import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../domain/usecases/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '../../domain/usecases/GetTransactionsUseCase';
import { GetBalanceUseCase } from '../../domain/usecases/GetBalanceUseCase';
import { TransactionType } from '../../domain/entities/Transaction';
import { Logger } from '../../infrastructure/logging/Logger';

export class TransactionController {
  constructor(
    private createTransactionUseCase: CreateTransactionUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private getBalanceUseCase: GetBalanceUseCase
  ) {}

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const logContext = {
        correlationId: req.correlationId || 'unknown',
        userId: (req as any).user?.id
      };

      Logger.getInstance().info('Creating transaction', logContext);

      const { user_id, amount, type } = req.body;

      // Validação simples
      if (!user_id || !amount || !type) {
        Logger.getInstance().warn('Missing required fields', { ...logContext, body: req.body });
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!['CREDIT', 'DEBIT'].includes(type)) {
        res.status(400).json({ error: 'Invalid transaction type' });
        return;
      }

      const transaction = await this.createTransactionUseCase.execute({
        user_id,
        amount,
        type: type as TransactionType
      });

      Logger.getInstance().info('Transaction created successfully', {
        ...logContext,
        transactionId: transaction.id,
        amount,
        type
      });

      res.status(201).json(transaction);
    } catch (error) {
      Logger.getInstance().error('Failed to create transaction', error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const type = req.query.type as TransactionType | undefined;

      Logger.getInstance().info('Retrieving transactions', {
        correlationId: req.correlationId,
        userId,
        type
      });

      const transactions = await this.getTransactionsUseCase.execute(userId, type);

      Logger.getInstance().info('Transactions retrieved successfully', {
        correlationId: req.correlationId,
        userId,
        count: transactions.length
      });

      res.json(transactions);
    } catch (error) {
      Logger.getInstance().error('Failed to retrieve transactions', error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      Logger.getInstance().info('Retrieving balance', {
        correlationId: req.correlationId,
        userId
      });

      const balance = await this.getBalanceUseCase.execute(userId);

      Logger.getInstance().info('Balance retrieved successfully', {
        correlationId: req.correlationId,
        userId,
        balance
      });

      res.json({ amount: balance });
    } catch (error) {
      Logger.getInstance().error('Failed to retrieve balance', error instanceof Error ? error : new Error('Unknown error'));
      res.status(500).json({ error: 'Failed to retrieve balance' });
    }
  }
}