import { Transaction, TransactionType } from '../entities/Transaction';
import { TransactionRepository, TransactionFilters } from '../repositories/TransactionRepository';

export interface GetTransactionsRequest {
  userId: string;
  type?: TransactionType;
}

export class GetTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(request: GetTransactionsRequest): Promise<Transaction[]> {
    const filters: TransactionFilters = {};
    
    if (request.type) {
      filters.type = request.type;
    }

    return await this.transactionRepository.findByUserId(request.userId, filters);
  }
}