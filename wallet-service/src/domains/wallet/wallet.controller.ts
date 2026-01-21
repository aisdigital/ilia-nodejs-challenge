import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateTransactionRequestDTO } from './dto/createTransaction.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Transaction } from './entity/transaction.entity';
import { UserId } from 'src/utils/decorators/user.decorator';

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

    return this.service.createTransaction(dto.user_id, transaction);
  }

  @Get('transactions')
  list(@Query('type') type?: 'CREDIT' | 'DEBIT') {
    return this.service.listTransactions(type);
  }

  @Get('balance')
  balance(@UserId() userId: number) {
    return this.service.getBalance(userId);
  }
}
