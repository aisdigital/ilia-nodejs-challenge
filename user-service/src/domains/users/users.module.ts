import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { UserController } from './users.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class AppModule {}
