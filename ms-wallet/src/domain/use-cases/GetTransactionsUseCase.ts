import { Transaction, TransactionType } from '../entities/Transaction';
import { TransactionRepository, TransactionFilters } from '../repositories/TransactionRepository';
import { Logger } from '../../infrastructure/logging/Logger';

export interface GetTransactionsRequest {
  userId: string;
  type?: TransactionType;
}

export class GetTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(request: GetTransactionsRequest): Promise<Transaction[]> {
    try {
      Logger.getInstance().info('GetTransactionsUseCase: Executing transaction retrieval', {
        userId: request.userId,
        requestedType: request.type || 'ALL'
      });

      const filters: TransactionFilters = {};
      
      if (request.type) {
        filters.type = request.type;
        Logger.getInstance().info('GetTransactionsUseCase: Applying type filter', {
          userId: request.userId,
          filterType: request.type
        });
      } else {
        Logger.getInstance().info('GetTransactionsUseCase: No type filter, retrieving all transactions', {
          userId: request.userId
        });
      }

      const transactions = await this.transactionRepository.findByUserId(request.userId, filters);

      Logger.getInstance().info('GetTransactionsUseCase: Transactions retrieved from repository', {
        userId: request.userId,
        count: transactions.length,
        filters,
        transactionIds: transactions.map(t => t.id)
      });

      return transactions;
    } catch (error) {
      Logger.getInstance().error('GetTransactionsUseCase: Error retrieving transactions', {
        userId: request.userId,
        requestedType: request.type,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
      throw error;
    }
  }
}