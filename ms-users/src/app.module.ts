import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [UserModule, RepositoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
