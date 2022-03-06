import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import { inject, injectable } from 'tsyringe';
import { ITransaction } from '../infra/mongoose/entities/TransactionEntity';

@injectable()
class BalanceCalculator {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute() {
    const transactions = await this.transactionsRepository.find();
    if (!transactions?.length) return { amount: 0 };

    const amount = transactions.reduce(
      (acc: number, transaction: ITransaction) => {
        return transaction.type === 'CREDIT'
          ? acc + transaction.amount
          : acc - transaction.amount;
      },
      0,
    );

    return { amount };
  }
}

export default BalanceCalculator;
