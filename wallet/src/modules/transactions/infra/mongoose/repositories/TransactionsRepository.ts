import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import ICreateTransactionDTO from '@modules/transactions/dtos/ICreateTransactionDTO';
import TransactionEntity, {
  ITransaction,
  TransactionType,
} from '../entities/TransactionEntity';

class TransactionsRepository implements ITransactionsRepository {
  public async find(): Promise<ITransaction[]> {
    return TransactionEntity.find();
  }

  public async findByType(type: TransactionType): Promise<ITransaction[]> {
    return TransactionEntity.find({ type });
  }

  public async create(
    transaction: ICreateTransactionDTO,
  ): Promise<ITransaction> {
    return TransactionEntity.create(transaction);
  }

  public async calculateBalance(): Promise<number> {
    const result = await TransactionEntity.aggregate([
      {
        $group: {
          _id: null,
          amount: {
            $sum: {
              $cond: {
                if: { $eq: ['$type', 'CREDIT'] },
                then: '$amount',
                else: { $multiply: ['$amount', -1] },
              },
            },
          },
        },
      },
    ]);

    return result?.[0]?.amount || 0;
  }
}

export default TransactionsRepository;
