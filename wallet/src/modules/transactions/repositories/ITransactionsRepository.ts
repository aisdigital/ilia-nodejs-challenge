import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';
import { ITransaction } from '../infra/mongoose/entities/TransactionEntity';

export default interface ITransactionsRepository {
  find(): Promise<ITransaction[]>;
  create(data: ICreateTransactionDTO): Promise<ITransaction>;
}
