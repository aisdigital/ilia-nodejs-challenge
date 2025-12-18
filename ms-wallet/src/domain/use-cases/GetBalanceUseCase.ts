import { TransactionRepository, Balance } from '../repositories/TransactionRepository';

export interface GetBalanceRequest {
  userId: string;
}

export class GetBalanceUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(request: GetBalanceRequest): Promise<Balance> {
    return await this.transactionRepository.getBalance(request.userId);
  }
}