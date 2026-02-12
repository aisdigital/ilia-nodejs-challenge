import { Inject, Injectable } from '@nestjs/common';
import { type ITransactionRepository, TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';
import { BalanceResponseDto, GetBalanceDto } from './get-balance.dto';

@Injectable()
export class GetBalanceUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(dto: GetBalanceDto): Promise<BalanceResponseDto> {
    const amount = await this.transactionRepository.calculateBalance(dto.userId);
    return { amount };
  }
}