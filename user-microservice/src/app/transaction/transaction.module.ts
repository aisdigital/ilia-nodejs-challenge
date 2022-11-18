import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';

@Module({
  imports: [HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
