import { TransactionRepository } from '../repositories/TransactionRepository';
import { WalletUserRepository } from '../repositories/WalletUserRepository';
import { CreateTransactionInput } from '../schemas/transaction.schema';
import { TransactionModel, BalanceResponse, GroupedTransaction } from '../types/transaction.types';

const MAX_INT32 = Number.MAX_SAFE_INTEGER;

export class TransactionService {
  private readonly repository: TransactionRepository;
  private readonly walletUserRepository: WalletUserRepository;

  constructor() {
    this.repository = new TransactionRepository();
    this.walletUserRepository = new WalletUserRepository();
  }

  async createTransaction(userId: string, data: CreateTransactionInput): Promise<TransactionModel> {
    const walletUser = await this.walletUserRepository.findByExternalUserId(userId);
    if (!walletUser) {
      throw new Error('User Not Valid');
    }

    if (data.amount > MAX_INT32) {
      throw new Error(`Amount exceeds maximum allowed value of ${MAX_INT32} cents (${(MAX_INT32 / 100).toFixed(2)} dollars)`);
    }

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

  // ...existing code...

  async listTransactions(userId: string, typeFilter?: string): Promise<TransactionModel[]> {
    const transactions = await this.repository.findByUser(userId, typeFilter);

    return transactions.map((tx: any) => ({
      id: tx.id,
      user_id: tx.userId,
      type: tx.type as 'CREDIT' | 'DEBIT',
      amount: tx.amount,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    }));
  }

  async calculateBalance(userId: string): Promise<BalanceResponse> {
    const groupedTransactions = await this.repository.getGroupedByType(userId);

    const creditSum = groupedTransactions.find((group: GroupedTransaction) => group.type === 'CREDIT')?._sum.amount || 0;
    const debitSum = groupedTransactions.find((group: GroupedTransaction) => group.type === 'DEBIT')?._sum.amount || 0;

    const balance = creditSum - debitSum;

    return { amount: balance };
  }
}
