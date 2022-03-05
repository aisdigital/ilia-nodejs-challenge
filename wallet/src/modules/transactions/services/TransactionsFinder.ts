import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';

class TransactionsFinder {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  execute() {
    return this.transactionsRepository.find();
  }
}

export default TransactionsFinder;
