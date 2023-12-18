import { Module } from '@nestjs/common';
import { WalletController } from './controllers/wallet.controller';

@Module({
  providers: [],
  controllers: [WalletController],
})
export class WalletModule {}
