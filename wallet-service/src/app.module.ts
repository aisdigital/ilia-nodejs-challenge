import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from './utils/env/env.service';
import { PrismaModule } from './utils/prisma/prisma.module';
import { WalletModule } from './domains/wallet/wallet.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    PrismaModule,
    WalletModule,
    PassportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
