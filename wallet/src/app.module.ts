import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from './modules/wallet/wallet.module';
import { env } from './shared/config/env';

@Module({
  imports: [MongooseModule.forRoot(env.mongoUrl), TransactionsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
