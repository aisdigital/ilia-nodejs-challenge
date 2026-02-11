import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  CreateTransactionDto,
  TransactionType,
} from '../application/dtos/create-transaction.dto';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  @Post('transactions')
  create(@Body() body: CreateTransactionDto) {
    return {
      message: 'Transaction endpoint scaffolded',
      data: body,
    };
  }

  @Get('transactions')
  list(@Query('type') type?: TransactionType) {
    return {
      message: 'Transactions list endpoint scaffolded',
      filter: type ?? null,
      data: [],
    };
  }

  @Get('balance')
  balance() {
    return {
      amount: 0,
      message: 'Balance endpoint scaffolded',
    };
  }
}
