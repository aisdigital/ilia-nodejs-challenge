import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import { inject, injectable } from 'tsyringe';

@injectable()
class BalanceCalculator {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute() {
    const amount = await this.transactionsRepository.calculateBalance();

    return { amount };
  }
}

export default BalanceCalculator;
