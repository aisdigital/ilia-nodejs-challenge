import { Module } from '@nestjs/common';
import { IUsersService } from './ports/users.service.interface';
import { UsersServiceMock } from './services/users.service.mock';

@Module({
  providers: [
    {
      provide: IUsersService,
      useClass: UsersServiceMock,
    },
  ],
  exports: [IUsersService],
})
export class UsersModule {}
