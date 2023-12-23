import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RepositoryModule } from './repository/repository.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, RepositoryModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
