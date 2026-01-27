import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  createWallet(@Body() data: CreateWalletDto) {
    return this.walletService.createWallet(data);
  }

  @Get('user/:user_id')
  findWalletByUserId(@Param('user_id') user_id: string) {
    return this.walletService.findWalletByUserId(user_id);
  }

  @Post(':wallet_id/transactions')
  createTransaction(@Param('wallet_id') wallet_id: string, @Body() data: CreateTransactionDto) {
    return this.walletService.createTransaction({ ...data, wallet_id });
  }

  @Get(':wallet_id/transactions')
  getTransactions(@Param('wallet_id') wallet_id: string) {
    return this.walletService.getTransactions(wallet_id);
  }

  @Get(':wallet_id/balance')
  getBalance(@Param('wallet_id') wallet_id: string) {
    return this.walletService.getBalance(wallet_id);
  }
}
