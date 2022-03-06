import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';
import {
  ITransaction,
  TransactionType,
} from '../infra/mongoose/entities/TransactionEntity';

export default interface ITransactionsRepository {
  find(): Promise<ITransaction[]>;
  findByType(type: TransactionType): Promise<ITransaction[]>;
  create(data: ICreateTransactionDTO): Promise<ITransaction>;
}
