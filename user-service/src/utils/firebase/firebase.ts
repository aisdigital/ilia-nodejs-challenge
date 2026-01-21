import fs from 'fs';
import * as admin from 'firebase-admin';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

export class FirebaseConnection {
  private serviceAccount: any;
  private app: admin.app.App;
  constructor(credentials: string) {
    this.serviceAccount = this.loadServiceAccount(credentials);
    this.app = this.initializeFirebaseAdmin();
  }

  private loadServiceAccount(credentials: string): any {
    if (credentials === '') {
      console.info('Environment variable FIREBASE_CREDENTIALS is empty');
      process.exit(1);
    }

    try {
      const path: fs.PathLike = Buffer.from(credentials);
      const fileData = fs.readFileSync(path);

      return JSON.parse(fileData.toString());
    } catch (e) {
      console.info('Unable to load FIREBASE_CREDENTIALS');
      process.exit(1);
    }
  }

  private initializeFirebaseAdmin(): admin.app.App {
    if (admin.apps.length > 0) {
      return admin.app();
    }
    return admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
    });
  }

  public getApp(): admin.app.App {
    return this.app;
  }

  public async authenticateRequest(
    req: any,
  ): Promise<{ uid: string; email: string }> {
    const authHeader =
      req.get('bankuish-authorization') ||
      req.get('x-forwarded-authorization') ||
      req.get('authorization');

    if (!authHeader) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    try {
      const { uid, email } = await this.app.auth().verifyIdToken(token);

      return { uid, email: email ?? '' };
    } catch (err) {
      if (err instanceof Error) {
        throw new ForbiddenException(err.message);
      } else {
        throw new ForbiddenException(err.message);
      }
    }
  }

  public async deleteUser(uuid: string): Promise<void> {
    await this.app.auth().deleteUser(uuid);
  }

  public async getUser(localId: string): Promise<admin.auth.UserRecord> {
    return await this.app.auth().getUser(localId);
  }
}
