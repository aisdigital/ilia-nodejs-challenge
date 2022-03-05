
import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import TransactionEntity, { ITransaction } from '../entities/TransactionEntity';

class TransactionsRepository implements ITransactionsRepository {
  public async find(): Promise<ITransaction[]> {
    return TransactionEntity.find();
  }

  public async create(transaction: ICreateTransactionDTO): Promise<ITransaction> {
    return TransactionEntity.create(transaction);
  }
}

export default TransactionsRepository;

