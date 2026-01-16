import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export interface GetBalanceInput {
  userId: string;
}

export interface GetBalanceOutput {
  amount: number;
}

export class GetBalance {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(input: GetBalanceInput): Promise<GetBalanceOutput> {
    const balance = await this.transactionRepository.calculateBalance(input.userId);

    return {
      amount: balance,
    };
  }
}
