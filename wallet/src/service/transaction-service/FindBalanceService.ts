import { ITransactionRepository } from "@repositories/transaction-repository/ITransactionRepository";

type ExpectedReturn = {
  amount: number;
};

export class FindBalanceService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(user_id: string): Promise<ExpectedReturn> {
    const balances = await this.transactionRepository.findBalance(user_id);

    const amount = balances.reduce((acc: number, curr) => {
      if (curr.type === "CREDIT") {
        return acc + curr.amount;
      } else return acc - curr.amount;
    }, 0);

    return { amount };
  }
}
