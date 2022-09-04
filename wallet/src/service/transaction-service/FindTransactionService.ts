import { ITransactionRepository } from "@repositories/transaction-repository/ITransactionRepository";

type ExpectedReturn = {
  type: string;
};

export class FindTransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(type: string): Promise<ExpectedReturn[]> {
    const activeTransactions = await this.transactionRepository.findTransaction(type);
    const filterBy = activeTransactions.filter((transaction) => {
      return transaction.type === type;
    });

    return filterBy;
  }
}
