import { Module } from '@nestjs/common';
import { FIREBASE_APP } from './utils/consts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { firebaseAdminFactory } from './utils/firebase-admin.factory';
import { validate } from './utils/env/env.service';

@Module({
  imports: [ConfigModule.forRoot({ validate })],
  controllers: [],
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: firebaseAdminFactory,
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
