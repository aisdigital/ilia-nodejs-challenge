import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { Authorization } from '@shared/utils/decorators/auth.decorator';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionService } from './transaction.service';

@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transaction')
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Authorization() accessToken: string,
  ) {
    return this.transactionService.create(createTransactionDto, accessToken);
  }

  @Get('balance')
  findById(@Authorization() accessToken: string) {
    const data = this.transactionService.getBalance(accessToken);
    return data;
  }
}
