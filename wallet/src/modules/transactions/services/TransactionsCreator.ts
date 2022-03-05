import ITransactionsRepository from '@modules/transactions/repositories/ITransactionsRepository';
import AppError from '@shared/errors/AppErros';
import { inject, injectable } from 'tsyringe';
import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';

@injectable()
class TransactionsCreator {
  constructor(
    @inject('TransactionsRepository')
    private transactionsRepository: ITransactionsRepository,
  ) {}

  async execute({ user_id, amount, type }: ICreateTransactionDTO) {
    return this.transactionsRepository
      .create({ user_id, amount, type })
      .catch(() => {
        throw new AppError('Erro ao registrar  transação.', 500);
      });
  }
}

export default TransactionsCreator;
