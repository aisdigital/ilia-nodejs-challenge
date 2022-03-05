import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class TransactionsFinder {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  execute() {
    return this.transactionsRepository.find();
  }
}

export default TransactionsFinder;
