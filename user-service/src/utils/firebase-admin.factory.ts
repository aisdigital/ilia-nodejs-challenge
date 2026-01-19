import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../utils/env/env.service';
import { FirebaseConnection } from './firebase/firebase';

export function firebaseAdminFactory(
  envService: ConfigService<EnvSchema, true>,
) {
  return new FirebaseConnection(envService.get('FIREBASE_CREDENTIALS'));
}
