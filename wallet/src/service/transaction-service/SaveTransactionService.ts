import { ITransactionRepository } from "@repositories/transaction-repository/ITransactionRepository";

type ExpectedReturn = {
  user_id?: string;
  amount: number;
  type: string;
  id?: string;
};

export class SaveTransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(amount: number, type: string): Promise<ExpectedReturn> {
    const saveTransaction = await this.transactionRepository.save(amount, type);

    return saveTransaction;
  }
}
