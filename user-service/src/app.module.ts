import { Module } from '@nestjs/common';
import { FIREBASE_APP } from './utils/consts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { firebaseAdminFactory } from './utils/firebase-admin.factory';
import { validate } from './utils/env/env.service';
import { PrismaService } from './utils/prisma/prisma.service';
import { AuthModule } from './domains/auth/auth.module';
import { UserModule } from './domains/users/users.module';


@Module({
  imports: [ConfigModule.forRoot({ validate }), AuthModule, UserModule],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: FIREBASE_APP,
      useFactory: firebaseAdminFactory,
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
