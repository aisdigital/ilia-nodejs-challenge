import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { UserController } from './users.controller';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, AuthenticationGuard],
})
export class UserModule {}
