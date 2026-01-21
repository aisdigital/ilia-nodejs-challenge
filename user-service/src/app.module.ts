import { Module } from '@nestjs/common';
import { FIREBASE_APP } from './utils/consts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { firebaseAdminFactory } from './utils/firebase-admin.factory';
import { validate } from './utils/env/env.service';
import { AuthModule } from './domains/auth/auth.module';
import { UserModule } from './domains/users/users.module';
import { PrismaModule } from './utils/prisma/prisma.module';
import { FirebaseModule } from './utils/firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ validate, isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    FirebaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
