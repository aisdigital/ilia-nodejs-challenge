import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateTransactionRequestDTO } from './dto/createTransaction.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Transaction } from './entity/transaction.entity';

@Controller()
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Post('transactions')
  create(@Body() dto: CreateTransactionRequestDTO) {
    const transaction: Transaction = {
      user_id: dto.user_id,
      amount: dto.amount,
      type: dto.type,
    };

    return this.service.createTransaction(transaction);
  }

  @Get('transactions')
  list(@Query('type') type?: 'CREDIT' | 'DEBIT') {
    return this.service.listTransactions(type);
  }

  @Get('balance')
  balance() {
    return this.service.getBalance();
  }
}
