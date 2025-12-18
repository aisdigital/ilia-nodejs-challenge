import { Request, Response } from 'express';
import { CreateTransactionUseCase } from '../../domain/use-cases/CreateTransactionUseCase';
import { GetTransactionsUseCase } from '../../domain/use-cases/GetTransactionsUseCase';
import { GetBalanceUseCase } from '../../domain/use-cases/GetBalanceUseCase';
import { TransactionType } from '../../domain/entities/Transaction';
import { Logger } from '../../infrastructure/logging/Logger';

export class TransactionController {
  constructor(
    private createTransactionUseCase: CreateTransactionUseCase,
    private getTransactionsUseCase: GetTransactionsUseCase,
    private getBalanceUseCase: GetBalanceUseCase
  ) {}

  async createTransaction(req: Request, res: Response): Promise<void> {
    const logContext = {
      correlationId: req.correlationId || 'unknown',
      userId: (req as any).user?.id
    };
    
    try {

      Logger.getInstance().info('Creating transaction', {
        ...logContext,
        requestBody: {
          user_id: req.body.user_id,
          amount: req.body.amount,
          type: req.body.type
        },
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      const { user_id, amount, type } = req.body;

      // Validação detalhada
      const missingFields = [];
      if (!user_id) missingFields.push('user_id');
      if (!amount) missingFields.push('amount');
      if (!type) missingFields.push('type');
      
      if (missingFields.length > 0) {
        Logger.getInstance().warn('Transaction validation failed - missing required fields', { 
          ...logContext, 
          missingFields,
          providedFields: Object.keys(req.body),
          body: req.body
        });
        res.status(400).json({ 
          error: 'Missing required fields', 
          missingFields,
          requiredFields: ['user_id', 'amount', 'type']
        });
        return;
      }
      
      // Validação de tipos
      if (typeof amount !== 'number' || amount <= 0) {
        Logger.getInstance().warn('Transaction validation failed - invalid amount', { 
          ...logContext, 
          amount,
          amountType: typeof amount,
          body: req.body
        });
        res.status(400).json({ 
          error: 'Invalid amount - must be a positive number', 
          provided: amount
        });
        return;
      }

      if (!['CREDIT', 'DEBIT'].includes(type)) {
        res.status(400).json({ error: 'Invalid transaction type' });
        return;
      }

      const transaction = await this.createTransactionUseCase.execute({
        userId: user_id,
        amount,
        type: type as TransactionType
      });

      Logger.getInstance().info('✅ Transaction created successfully', {
        ...logContext,
        transactionId: transaction.id,
        userId: user_id,
        amount,
        type,
        transactionData: {
          id: transaction.id,
          createdAt: transaction.createdAt,
          amount: transaction.amount,
          type: transaction.type
        },
        processingTime: Date.now() - (req as any).startTime
      });

      res.status(201).json(transaction);
    } catch (error) {
      const errorDetails = {
        ...logContext,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        requestBody: req.body,
        timestamp: new Date().toISOString()
      };
      
      // Log específico baseado no tipo de erro
      if (error instanceof Error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          Logger.getInstance().error('Transaction creation failed - duplicate transaction detected', {
            ...errorDetails,
            errorType: 'DUPLICATE_TRANSACTION'
          });
          res.status(409).json({ 
            error: 'Duplicate transaction detected',
            code: 'DUPLICATE_TRANSACTION'
          });
        } else if (error.message.includes('insufficient funds') || error.message.includes('balance')) {
          Logger.getInstance().error('Transaction creation failed - insufficient funds', {
            ...errorDetails,
            errorType: 'INSUFFICIENT_FUNDS'
          });
          res.status(400).json({ 
            error: 'Insufficient funds for this transaction',
            code: 'INSUFFICIENT_FUNDS'
          });
        } else if (error.message.includes('user not found') || error.message.includes('invalid user')) {
          Logger.getInstance().error('Transaction creation failed - invalid user', {
            ...errorDetails,
            errorType: 'INVALID_USER'
          });
          res.status(404).json({ 
            error: 'User not found',
            code: 'INVALID_USER'
          });
        } else if (error.message.includes('database') || error.message.includes('connection')) {
          Logger.getInstance().error('Transaction creation failed - database error', {
            ...errorDetails,
            errorType: 'DATABASE_ERROR'
          });
          res.status(503).json({ 
            error: 'Service temporarily unavailable',
            code: 'DATABASE_ERROR'
          });
        } else {
          Logger.getInstance().error('Transaction creation failed - unexpected error', {
            ...errorDetails,
            errorType: 'UNEXPECTED_ERROR'
          });
          res.status(500).json({ 
            error: 'Internal server error during transaction creation',
            code: 'UNEXPECTED_ERROR'
          });
        }
      } else {
        Logger.getInstance().error('Transaction creation failed - unknown error type', {
          ...errorDetails,
          errorType: 'UNKNOWN_ERROR'
        });
        res.status(500).json({ 
          error: 'Internal server error',
          code: 'UNKNOWN_ERROR'
        });
      }
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

      const transactions = await this.getTransactionsUseCase.execute({ userId, type });

      Logger.getInstance().info('✅ Transactions retrieved successfully', {
        correlationId: req.correlationId,
        userId,
        count: transactions.length,
        filters: { type },
        resultSummary: {
          total: transactions.length,
          types: [...new Set(transactions.map(t => t.type))],
          dateRange: transactions.length > 0 ? {
            oldest: Math.min(...transactions.map(t => new Date(t.createdAt).getTime())),
            newest: Math.max(...transactions.map(t => new Date(t.createdAt).getTime()))
          } : null
        },
        processingTime: Date.now() - (req as any).startTime
      });

      res.json(transactions);
    } catch (error) {
      const errorDetails = {
        correlationId: req.correlationId,
        userId: (req as any).user?.id,
        queryParams: req.query,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      
      if (error instanceof Error) {
        if (error.message.includes('user not found') || error.message.includes('invalid user')) {
          Logger.getInstance().error('Failed to retrieve transactions - user not found', {
            ...errorDetails,
            errorType: 'USER_NOT_FOUND'
          });
          res.status(404).json({ 
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        } else if (error.message.includes('database') || error.message.includes('connection')) {
          Logger.getInstance().error('Failed to retrieve transactions - database error', {
            ...errorDetails,
            errorType: 'DATABASE_ERROR'
          });
          res.status(503).json({ 
            error: 'Service temporarily unavailable',
            code: 'DATABASE_ERROR'
          });
        } else {
          Logger.getInstance().error('Failed to retrieve transactions - unexpected error', {
            ...errorDetails,
            errorType: 'UNEXPECTED_ERROR'
          });
          res.status(500).json({ 
            error: 'Internal server error while retrieving transactions',
            code: 'UNEXPECTED_ERROR'
          });
        }
      } else {
        Logger.getInstance().error('Failed to retrieve transactions - unknown error', {
          ...errorDetails,
          errorType: 'UNKNOWN_ERROR'
        });
        res.status(500).json({ 
          error: 'Internal server error',
          code: 'UNKNOWN_ERROR'
        });
      }
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

      Logger.getInstance().info('✅ Balance retrieved successfully', {
        correlationId: req.correlationId,
        userId,
        balance,
        balanceFormatted: `$${(typeof balance === 'number' ? balance : balance.amount).toFixed(2)}`,
        processingTime: Date.now() - (req as any).startTime
      });

      res.json({ amount: balance });
    } catch (error) {
      const errorDetails = {
        correlationId: req.correlationId,
        userId: (req as any).user?.id,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      
      if (error instanceof Error) {
        if (error.message.includes('user not found') || error.message.includes('invalid user')) {
          Logger.getInstance().error('Failed to retrieve balance - user not found', {
            ...errorDetails,
            errorType: 'USER_NOT_FOUND'
          });
          res.status(404).json({ 
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          });
        } else if (error.message.includes('database') || error.message.includes('connection')) {
          Logger.getInstance().error('Failed to retrieve balance - database error', {
            ...errorDetails,
            errorType: 'DATABASE_ERROR'
          });
          res.status(503).json({ 
            error: 'Service temporarily unavailable',
            code: 'DATABASE_ERROR'
          });
        } else {
          Logger.getInstance().error('Failed to retrieve balance - unexpected error', {
            ...errorDetails,
            errorType: 'UNEXPECTED_ERROR'
          });
          res.status(500).json({ 
            error: 'Internal server error while retrieving balance',
            code: 'UNEXPECTED_ERROR'
          });
        }
      } else {
        Logger.getInstance().error('Failed to retrieve balance - unknown error', {
          ...errorDetails,
          errorType: 'UNKNOWN_ERROR'
        });
        res.status(500).json({ 
          error: 'Internal server error',
          code: 'UNKNOWN_ERROR'
        });
      }
    }
  }
}