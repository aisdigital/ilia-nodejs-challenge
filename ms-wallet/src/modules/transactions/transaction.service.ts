import { Transaction, TransactionType } from './transaction.model';
import { ITransactionRepository } from './transaction.repository.interface';
import { CreateTransactionDTO, ListTransactionsQueryDTO, BalanceResponseDTO } from './transaction.schema';
import { InsufficientBalanceError } from '../../shared/errors/app-error';
import { IBalanceRepository } from '../balances/balance.repository.interface';
import { BalanceRepository } from '../balances/balance.repository';
import { TransactionManager } from '../../shared/database/transaction-manager';

export class TransactionService {
  private balanceRepository: IBalanceRepository;

  constructor(
    private repository: ITransactionRepository,
    balanceRepository?: IBalanceRepository
  ) {
    this.balanceRepository = balanceRepository || new BalanceRepository();
  }

  async create(data: CreateTransactionDTO): Promise<Transaction> {
    return TransactionManager.executeInTransaction(async (dbTransaction) => {
      await this.balanceRepository.ensureBalance(data.user_id, dbTransaction);

      const balance = await this.balanceRepository.findByUserIdWithLock(
        data.user_id, 
        dbTransaction
      );

      if (!balance) {
        throw new Error(`Balance record not found for user ${data.user_id}`);
      }

      const currentBalance = Number(balance.amount);

      if (data.type === TransactionType.DEBIT) {
        if (currentBalance < data.amount) {
          throw new InsufficientBalanceError();
        }
      }

      const transaction = await this.repository.create(data, dbTransaction);

      const amountDelta = data.type === TransactionType.CREDIT 
        ? data.amount 
        : -data.amount;

      await this.balanceRepository.incrementBalance(
        data.user_id,
        amountDelta,
        dbTransaction
      );

      return transaction;
    });
  }

  async list(userId: string, query: ListTransactionsQueryDTO): Promise<Transaction[]> {
    return await this.repository.findByUserId(userId, query.type);
  }

  async getBalance(userId: string): Promise<BalanceResponseDTO> {
    const balance = await this.balanceRepository.findByUserId(userId);
    const amount = balance ? Number(balance.amount) : 0;
    
    return { amount };
  }
}