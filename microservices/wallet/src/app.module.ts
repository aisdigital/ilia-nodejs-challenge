import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './shared/auth/auth.module';
// import { WalletModule } from './modules/wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { TransactionEntity } from './modules/wallet/infra/typeorm/entities/Transaction.entity';

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

    // WalletModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
