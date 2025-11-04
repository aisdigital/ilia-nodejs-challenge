import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import databaseConfig from './infrastructure/config/database.config';
import appConfig from './infrastructure/config/app.config';
import kafkaConfig from './infrastructure/config/kafka.config';
import { DatabaseConfig } from './infrastructure/config/database.config';
import { AppConfig } from './infrastructure/config/app.config';
import { UserOrmEntity } from './infrastructure/database/entities/user.orm-entity';
import { TypeOrmUserRepository } from './infrastructure/database/repositories/typeorm-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from './application/use-cases/get-all-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UserController } from './presentation/controllers/user.controller';
import { AuthController } from './presentation/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { JwtService as CustomJwtService } from './infrastructure/auth/jwt.service';
import { KafkaProducerService } from './infrastructure/messaging/kafka-producer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, kafkaConfig],
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
          entities: [UserOrmEntity],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([UserOrmEntity]),
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
  controllers: [UserController, AuthController],
  providers: [
    {
      provide: 'UserRepositoryInterface',
      useClass: TypeOrmUserRepository,
    },
    CreateUserUseCase,
    AuthenticateUserUseCase,
    GetUserByIdUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    JwtStrategy,
    CustomJwtService,
    KafkaProducerService,
  ],
})
export class AppModule {}
