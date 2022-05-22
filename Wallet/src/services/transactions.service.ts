import { EntityRepository, Repository } from 'typeorm';
import { CreateTransactionDto } from '@/dtos/transactions.dto';
import { TransactionsEntity } from '@/entities/transactions.entity';
import { HttpException } from '@exceptions/HttpException';
import { Transactions, TransactionType } from '@interfaces/transactions.interface';
import { isEmpty } from '@utils/util';

@EntityRepository()
class TransactionsService extends Repository<TransactionsEntity> {
  public async findTransactionByType(type: string): Promise<Transactions[]> {
    type = type.toUpperCase();
    if (!this.isValidTransactionType(type)) throw new HttpException(400, "You're not transactionType");

    const findTransactions: Transactions[] = await TransactionsEntity.find({ where: { type: type } });
    return findTransactions;
  }

  public async createTransaction(transactionData: CreateTransactionDto): Promise<Transactions> {
    if (isEmpty(transactionData)) throw new HttpException(400, "You're not transactionData");

    const createUserData: Transactions = await TransactionsEntity.create(transactionData).save();
    return createUserData;
  }

  private isValidTransactionType(type: string) {
    const types = Object.values(TransactionType) as string[];
    return types.includes(type);
  }
}

export default TransactionsService;
