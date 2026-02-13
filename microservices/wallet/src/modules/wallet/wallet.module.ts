import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infra/typeorm/entities/Transaction.entity';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { UsersModule } from '../users/users.module';
import { WalletRepositoryAdapter } from './infra/typeorm/repositoreis/WalletRepository.adapter';
import { WalletController } from './presentations/wallet.controller';
import { IWalletRepository } from './domain/repositories/IWalletRepository'; //'../../../domain/repositories/IWalletRepository';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity]), UsersModule],
  providers: [
    {
      provide: IWalletRepository,
      useClass: WalletRepositoryAdapter,
    },
    CreateTransactionUseCase,
  ],
  controllers: [WalletController],
  exports: [IWalletRepository, CreateTransactionUseCase],
})
export class WalletModule {}
