import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { UserRepository } from './users.repository';
import { UserController } from './users.controller';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../../utils/env/env.service';
import { PrismaService } from 'src/utils/prisma/prisma.service';
import { AuthenticationGuard } from 'src/utils/guards/authentication.guard';

@Module({
  imports: [ConfigModule.forRoot({ validate })],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, AuthenticationGuard],
})
export class UserModule {}
