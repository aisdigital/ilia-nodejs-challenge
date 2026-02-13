import { Module } from '@nestjs/common';
import { IUsersService } from './ports/users.service.interface';
// import { UsersServiceMock } from './services/users.service.mock';
import { UsersGrpcAdapter } from './services/users-grpc.adapter';

@Module({
  providers: [
    {
      provide: IUsersService,
      useClass: UsersGrpcAdapter,
    },
  ],
  exports: [IUsersService],
})
export class UsersModule {}
