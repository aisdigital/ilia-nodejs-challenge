import { EntityRepository, getRepository, Repository } from 'typeorm';
import { TransactionsEntity } from '@/entities/transactions.entity';
import { TransactionType } from '@interfaces/transactions.interface';
import { Amount } from '@/interfaces/balance.interface';

@EntityRepository()
class BalanceService extends Repository<TransactionsEntity> {
  public async calculateAmount(): Promise<Amount> {
    const total: Amount = await getRepository(TransactionsEntity)
      .createQueryBuilder('transactions')
      .select(
        `SUM(
          CASE
            WHEN transactions.type = '${TransactionType.DEBIT}' THEN transactions.amount
            ELSE -transactions.amount
          END
      )`,
        'amount',
      )
      .getRawOne();

    return total;
  }
}

export default BalanceService;
