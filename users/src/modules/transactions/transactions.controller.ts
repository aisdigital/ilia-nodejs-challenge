import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@Req() request: Request, @ActiveUserId() userId: string) {
    console.log(request['token']);

    return this.transactionsService.listUserTransactions(userId);
  }

  @Post()
  create(
    @Req() request: Request,
    @ActiveUserId() userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.createUserTransaction(
      userId,
      createTransactionDto,
    );
  }

  @Get('balance')
  getBalance(@ActiveUserId() userId: string) {
    return this.transactionsService.getUserBalance(userId);
  }
}
