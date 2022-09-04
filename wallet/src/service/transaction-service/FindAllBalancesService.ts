import { ITransactionRepository } from "@repositories/transaction-repository/ITransactionRepository";

type ExpectedReturn = {
  amount: number;
};

export class FindAllBalancesService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(): Promise<ExpectedReturn> {
    const balances = await this.transactionRepository.findAllBalances();

    const amount = balances.reduce((acc: number, curr: { type: string; amount: number }) => {
      if (curr.type === "CREDIT") {
        return acc + curr.amount;
      } else return acc - curr.amount;
    }, 0);

    return { amount };
  }
}
