import { Injectable } from '@nestjs/common';
import { BalanceRepository } from './balance.repository';

@Injectable()
export class BalanceService {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  async getBalanceOfAllTransactions() {
    return await this.balanceRepository.getBalance();
  }

  findOne(id: number) {
    return `This action returns a #${id} balance`;
  }
}
