import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionSchema } from 'src/shared/database/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class TransactionsModule {}
