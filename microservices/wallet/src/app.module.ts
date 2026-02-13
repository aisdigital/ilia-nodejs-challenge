import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './shared/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TransactionEntity } from './modules/wallet/infra/typeorm/entities/Transaction.entity';
import { WalletModule } from './modules/wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_WALLET_HOST'),
        port: configService.get<number>('DB_WALLET_PORT'),
        username: configService.get<string>('DB_WALLET_USER'),
        password: configService.get<string>('DB_WALLET_PASSWORD'),
        database: configService.get<string>('DB_WALLET_NAME'),

        entities: [TransactionEntity],

        synchronize: true,
      }),
    }),
    WalletModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
