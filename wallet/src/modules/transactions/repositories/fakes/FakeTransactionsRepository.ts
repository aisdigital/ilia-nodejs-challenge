import { Types } from 'mongoose';
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import TransactionEntity, {
  ITransaction,
} from '@modules/transactions/infra/mongoose/entities/TransactionEntity';

class FakeTransactionsRepository implements ITransactionsRepository {
  private transactions: ITransaction[] = [];

  public async find(): Promise<ITransaction[]> {
    return this.transactions;
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
}

export default FakeTransactionsRepository;
