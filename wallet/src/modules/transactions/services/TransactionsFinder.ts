import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import { inject, injectable } from 'tsyringe';
import { TransactionType } from '../infra/mongoose/entities/TransactionEntity';

@injectable()
class TransactionsFinder {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  execute(type?: TransactionType) {
    if (type) return this.transactionsRepository.findByType(type);
    return this.transactionsRepository.find();
  }
}

export default TransactionsFinder;
