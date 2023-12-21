import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  getBalance() {
    return this.balanceService.getBalanceOfAllTransactions();
  }

  @Get(':user_id')
  findOne(@Param('user_id') user_id: string) {
    return this.balanceService.findOne(+user_id);
  }
}
