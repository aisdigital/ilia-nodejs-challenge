import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { IEnvService } from 'src/utils/env/env.service';
import { FirebaseResponse, JwtPayload } from './entity/signIn.entity';
import { AuthDTO } from './dto/auth.dto';
import { AuthResponseDTO } from './dto/authResponse.dto';
import { FIREBASE_APP } from 'src/utils/consts';
import { FirebaseConnection } from 'src/utils/firebase/firebase';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService<IEnvService>,
    @Inject(FIREBASE_APP) private readonly firebase: FirebaseConnection,
  ) {}

  private async callFirebaseApi(dto: AuthDTO) {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword/?key=${this.configService.getOrThrow('FIREBASE_API_KEY')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dto,
          returnSecureToken: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return (await response.json()) as FirebaseResponse;
  }

  signJwt(payload: JwtPayload): string {
    const privateKey = this.configService.getOrThrow('JWT_PRIVATE_KEY');
    return jwt.sign(payload, privateKey, {
      expiresIn: '24h',
      issuer: 'users-ms',
    });
  }

  signInternalJwt(payload: object): string {
    const internalKey = this.configService.getOrThrow('JWT_INTERNAL_KEY');
    return jwt.sign(payload, internalKey, {
      expiresIn: '5m',
      issuer: 'internal',
    });
  }

  async login(dto: AuthDTO): Promise<AuthResponseDTO> {
    const firebaseResponse = await this.callFirebaseApi(dto);

    const userRecord = await this.firebase.getUser(firebaseResponse.localId);

    const token = this.signJwt({
      sub: userRecord.uid,
      email: userRecord.email!,
    });

    return {
      user: {
        id: userRecord.uid,
        first_name: userRecord.displayName?.split(' ')[0] || '',
        last_name: userRecord.displayName?.split(' ')[1] || '',
        email: userRecord.email ?? '',
      },
      access_token: token,
    };
  }
}
