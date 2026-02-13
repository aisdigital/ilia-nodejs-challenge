/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infra/typeorm/entities/User.entity';
import { IAuthService } from './domain/services/IAuthService';
import { AuthAdapter } from './infra/auth/Auth.adapter';
import { UsersGrpcServerService } from './infra/grpc/UsersGrpcServer.service';
import { LoginUser } from './application/use-cases/LoginUser';
import { RegisterUser } from './application/use-cases/RegisterUser';
import { UsersController } from './presentation/users.controller';
import { IUserRepository } from './domain/repository/IUserRepository';
import { UserRepositoryAdapter } from './infra/typeorm/repositories/UserRepository.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: IAuthService,
      useClass: AuthAdapter,
    },
    RegisterUser,
    LoginUser,
    UsersGrpcServerService,
  ],
  controllers: [UsersController, UsersGrpcServerService],
  exports: [IUserRepository, IAuthService, UsersGrpcServerService],
})
export class UsersModule {}
