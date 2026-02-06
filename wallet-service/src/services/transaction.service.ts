import { TransactionRepository } from '../repositories/transaction.repository';
import { WalletUserRepository } from '../repositories/wallet-user.repository';
import { CreateTransactionInput } from '../schemas/transaction.schema';
import { TransactionModel, BalanceResponse, GroupedTransaction } from '../types/transaction.types';
import { TRANSACTION_TYPES, TRANSACTION_ERRORS, TRANSACTION_MAX_INT32 } from '../constants/transaction.constants';

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
      throw new Error(TRANSACTION_ERRORS.USER_NOT_FOUND);
    }

    if (data.amount > TRANSACTION_MAX_INT32) {
      throw new Error(`Amount exceeds maximum allowed value of ${TRANSACTION_MAX_INT32} cents (${(TRANSACTION_MAX_INT32 / 100).toFixed(2)} dollars)`);
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

    const creditSum = groupedTransactions.find((group: GroupedTransaction) => group.type === TRANSACTION_TYPES.CREDIT)?._sum.amount || 0;
    const debitSum = groupedTransactions.find((group: GroupedTransaction) => group.type === TRANSACTION_TYPES.DEBIT)?._sum.amount || 0;

    const balance = creditSum - debitSum;

    return { amount: balance };
  }
}
