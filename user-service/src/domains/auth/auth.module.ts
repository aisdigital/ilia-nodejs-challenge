import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FIREBASE_APP } from 'src/utils/consts';
import { firebaseAdminFactory } from 'src/utils/firebase-admin.factory';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate } from '../../utils/env/env.service';


@Module({
   imports: [ConfigModule.forRoot({ validate })],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: FIREBASE_APP,
      useFactory: firebaseAdminFactory,
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
