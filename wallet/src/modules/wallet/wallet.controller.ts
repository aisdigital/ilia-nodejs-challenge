import { Controller } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateTransactionDto } from 'src/shared/@types/User';

@Controller('transactions')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @MessagePattern('list-transactions')
  async listTransactions(@Payload() userId: string) {
    const transactions =
      await this.walletService.findAllTransactionsByUserId(userId);

    return transactions;
  }

  @MessagePattern('create-transaction')
  async createTransaction(
    @Payload() createTransactionDto: CreateTransactionDto,
  ) {
    const transaction =
      await this.walletService.createTransaction(createTransactionDto);

    return transaction;
  }

  @MessagePattern('get-balance')
  async getUserBalance(@Payload() userId: string) {
    const balance = await this.walletService.getUserBalance(userId);

    return balance;
  }
}
