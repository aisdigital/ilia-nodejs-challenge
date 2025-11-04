import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import appConfig, { AppConfig } from './infrastructure/config/app.config';
import databaseConfig, {
  DatabaseConfig,
} from './infrastructure/config/database.config';
import kafkaConfig from './infrastructure/config/kafka.config';
import { TransactionOrmEntity } from './infrastructure/database/entities/transaction.orm-entity';
import { TypeOrmTransactionRepository } from './infrastructure/database/repositories/typeorm-transaction.repository';
import { TRANSACTION_REPOSITORY } from './domain/repositories/transaction.repository.interface';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from './application/use-cases/get-transaction.use-case';
import { GetAllTransactionsUseCase } from './application/use-cases/get-all-transactions.use-case';
import { GetBalanceUseCase } from './application/use-cases/get-balance.use-case';
import { TransactionController } from './presentation/controllers/transaction.controller';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, kafkaConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<DatabaseConfig>('database');
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [TransactionOrmEntity],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appCfg = configService.get<AppConfig>('app');
        return {
          secret: appCfg.jwtSecret,
          signOptions: { expiresIn: '24h' },
        };
      },
    }),
  ],
  controllers: [TransactionController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: TypeOrmTransactionRepository,
    },
    CreateTransactionUseCase,
    GetTransactionUseCase,
    GetAllTransactionsUseCase,
    GetBalanceUseCase,
    JwtStrategy,
  ],
})
export class AppModule {}
