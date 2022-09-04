import { ITransactionRepository } from "@repositories/transaction-repository/ITransactionRepository";

type ExpectedReturn = {
  user_id?: string;
  amount: number;
  type: string;
  id?: string;
};

export class FindAllTransactionsService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(): Promise<ExpectedReturn[]> {
    const transactions = await this.transactionRepository.findAllBalances();
    return transactions;
  }
}
