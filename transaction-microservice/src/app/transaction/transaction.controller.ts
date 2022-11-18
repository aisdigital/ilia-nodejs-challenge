import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionService } from './transaction.service';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transactions')
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get('balance')
  findOne() {
    return this.transactionService.getBalance();
  }
}
