import { TransactionRepository } from '../repositories/TransactionRepository';
import { CreateTransactionInput } from '../schemas/transaction.schema';

interface TransactionOutput {
  id: string;
  user_id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface BalanceOutput {
  amount: number;
}

export class TransactionService {
  private repository: TransactionRepository;

  constructor() {
    this.repository = new TransactionRepository();
  }

  async createTransaction(userId: string, data: CreateTransactionInput): Promise<TransactionOutput> {
    const transaction = await this.repository.create({
      userId,
      type: data.type,
      amount: data.amount,
    });

    return {
      id: transaction.id,
      user_id: transaction.userId,
      type: transaction.type as 'CREDIT' | 'DEBIT',
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  async listTransactions(userId: string, typeFilter?: string): Promise<TransactionOutput[]> {
    const transactions = await this.repository.findByUser(userId, typeFilter);

    return transactions.map((tx) => ({
      id: tx.id,
      user_id: tx.userId,
      type: tx.type as 'CREDIT' | 'DEBIT',
      amount: tx.amount,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));
  }

  async calculateBalance(userId: string): Promise<BalanceOutput> {
    const groupedTransactions = await this.repository.getGroupedByType(userId);

    const creditSum = groupedTransactions.find((group) => group.type === 'CREDIT')?._sum.amount || 0;
    const debitSum = groupedTransactions.find((group) => group.type === 'DEBIT')?._sum.amount || 0;

    const balance = creditSum - debitSum;

    return { amount: balance };
  }
}
