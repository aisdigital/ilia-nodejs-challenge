import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../domain/use-cases/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '../../domain/use-cases/GetTransactionsUseCase';
import { GetBalanceUseCase } from '../../domain/use-cases/GetBalanceUseCase';
import { TransactionType } from '../../domain/entities/Transaction';
import { AuthenticatedRequest } from '../../infrastructure/middleware/AuthMiddleware';
import { logger } from '../../infrastructure/logging/Logger';
import Joi from 'joi';

export class TransactionController {
  constructor(
    private createTransactionUseCase: CreateTransactionUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private getBalanceUseCase: GetBalanceUseCase
  ) {}

  private validateCreateTransaction = Joi.object({
    user_id: Joi.string().required(),
    amount: Joi.number().integer().min(1).required(),
    type: Joi.string().valid('CREDIT', 'DEBIT').required()
  });

  public createTransaction = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const logContext = {
      correlationId: req.correlationId,
      userId: req.user?.userId,
      action: 'create_transaction'
    };

    try {
      logger.info('Starting transaction creation', logContext);
      
      const { error, value } = this.validateCreateTransaction.validate(req.body);
      
      if (error) {
        logger.warn('Transaction validation failed', {
          ...logContext,
          validationError: error.details[0].message,
          requestData: value
        });
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      logger.debug('Transaction validation passed', {
        ...logContext,
        transactionData: {
          userId: value.user_id,
          amount: value.amount,
          type: value.type
        }
      });

      const transaction = await this.createTransactionUseCase.execute({
        userId: value.user_id,
        amount: value.amount,
        type: value.type as TransactionType
      });

      logger.transaction('Transaction created successfully', {
        ...logContext,
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        targetUserId: value.user_id
      });

      res.status(200).json(transaction.toJSON());
    } catch (error) {
      logger.error('Failed to create transaction', {
        ...logContext,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const logContext = {
      correlationId: req.correlationId,
      userId: req.user?.userId,
      action: 'get_transactions'
    };

    try {
      logger.info('Retrieving transactions', logContext);
      
      const userId = req.user!.userId;
      const type = req.query.type as TransactionType | undefined;

      logger.debug('Transaction query parameters', {
        ...logContext,
        queryUserId: userId,
        filterType: type
      });

      const transactions = await this.getTransactionsUseCase.execute({
        userId,
        type
      });

      logger.info('Transactions retrieved successfully', {
        ...logContext,
        transactionCount: transactions.length,
        filterType: type
      });

      const response = transactions.map(transaction => transaction.toJSON());
      res.status(200).json(response);
    } catch (error) {
      logger.error('Failed to retrieve transactions', {
        ...logContext,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public getBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const logContext = {
      correlationId: req.correlationId,
      userId: req.user?.userId,
      action: 'get_balance'
    };

    try {
      logger.info('Retrieving user balance', logContext);
      
      const userId = req.user!.userId;

      const balance = await this.getBalanceUseCase.execute({ userId });

      logger.info('Balance retrieved successfully', {
        ...logContext,
        balance: balance.amount
      });

      res.status(200).json(balance);
    } catch (error) {
      logger.error('Failed to retrieve balance', {
        ...logContext,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}