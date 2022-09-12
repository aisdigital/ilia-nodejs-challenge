import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from 'src/config/config.module';
import { AuthModule } from 'src/shared/auth/auth.module';
import { TransactionController } from './transactions.controller';
import { TransactionSchema } from './transactions.schema';
import { TransactionService } from './transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'TransactionModel',
        schema: TransactionSchema,
        collection: 'transactions',
      },
    ]),
    AuthModule,
    ConfigModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
