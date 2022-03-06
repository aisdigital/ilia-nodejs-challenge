import { Types } from 'mongoose';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import TransactionEntity, {
  ITransaction,
  TransactionType,
} from '@modules/transactions/infra/mongoose/entities/TransactionEntity';

class FakeTransactionsRepository implements ITransactionsRepository {
  private transactions: ITransaction[] = [];

  public async find(): Promise<ITransaction[]> {
    return this.transactions;
  }

  public async findByType(type: TransactionType): Promise<ITransaction[]> {
    return this.transactions.filter(transaction => transaction.type === type);
  }

  public async create(data: ICreateTransactionDTO): Promise<ITransaction> {
    const transactionEntity = new TransactionEntity();

    const transaction = Object.assign(transactionEntity, {
      id: new Types.ObjectId(),
      ...data,
    });

    this.transactions.push(transaction);

    return transaction;
  }

  public async calculateBalance(): Promise<number> {
    return this.transactions.reduce(
      (acc: number, transaction: ITransaction) => {
        return transaction.type === 'CREDIT'
          ? acc + transaction.amount
          : acc - transaction.amount;
      },
      0,
    );
  }
}

export default FakeTransactionsRepository;
