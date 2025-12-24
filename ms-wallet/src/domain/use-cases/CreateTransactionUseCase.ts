import { Transaction, TransactionType } from '../entities/Transaction';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { Logger } from '../../infrastructure/logging/Logger';

export interface CreateTransactionRequest {
  userId: string;
  amount: number;
  type: TransactionType;
}

export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(request: CreateTransactionRequest): Promise<Transaction> {
    try {
      Logger.getInstance().info('CreateTransactionUseCase: Creating transaction entity', { 
        request: { userId: request.userId, amount: request.amount, type: request.type }
      });

      const transaction = Transaction.create({
        userId: request.userId,
        amount: request.amount,
        type: request.type
      });

      Logger.getInstance().info('CreateTransactionUseCase: Transaction entity created, saving to repository', { 
        transactionId: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type
      });

      const savedTransaction = await this.transactionRepository.save(transaction);

      Logger.getInstance().info('CreateTransactionUseCase: Transaction saved successfully', { 
        transactionId: savedTransaction.id
      });

      return savedTransaction;
    } catch (error) {
      Logger.getInstance().error('CreateTransactionUseCase: Error creating transaction', {
        request,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        fullError: error
      });
      throw error;
    }
  }
}