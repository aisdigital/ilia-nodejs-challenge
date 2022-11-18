import { Body, Controller, Post } from '@nestjs/common';
import { Authorization } from '@shared/utils/decorators/auth.decorator';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Authorization() accessToken: string,
  ) {
    return this.transactionService.create(createTransactionDto, accessToken);
  }
}
