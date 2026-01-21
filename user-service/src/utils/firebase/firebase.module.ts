import { ConfigService } from '@nestjs/config';
import { FIREBASE_APP } from '../consts';
import { firebaseAdminFactory } from '../firebase-admin.factory';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: FIREBASE_APP,
      useFactory: firebaseAdminFactory,
      inject: [ConfigService],
    },
  ],
  exports: [FIREBASE_APP],
})
export class FirebaseModule {}
