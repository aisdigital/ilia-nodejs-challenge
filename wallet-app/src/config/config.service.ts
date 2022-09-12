import { randomUUID } from 'crypto';
import dotenv, { DotenvConfigOutput } from 'dotenv';
import fs from 'fs';
import { IAuthParams } from 'src/shared/auth/interfaces/auth.interface';
import { IMongoConnection } from './interfaces/mongo-connection.interface';

export class ConfigService {
  private readonly envConfig: any;

  constructor() {
    this.envConfig = (key) => process.env[key];
  }

  getString(key: string): string {
    return this.envConfig(key);
  }

  getNumber(key: string): number {
    const n = this.getString(key);

    if (n)
      try {
        return parseInt(n);
      } catch (err) {
        return 0;
      }
    else return 0;
  }

  getJwtSecret(): string {
    return this.getString('JWT_SECRET');
  }

  getJwtExpires(): number {
    return this.getNumber('JWT_EXPIRES');
  }

  getJwtPainelExpires(): number {
    return this.getNumber('JWT_PAINEL_EXPIRES');
  }

  getMongoConfig(): IMongoConnection {
    console.log(this.getMongoUri());

    return {
      name: this.getString('MONGO_NAME') || 'wallet',
      host: this.getString('MONGO_HOST'),
      port: this.getNumber('MONGO_PORT'),
      username: this.getString('MONGO_USERNAME'),
      password: this.getString('MONGO_PASSWORD'),
      uri: this.getString('MONGO_URI') || this.getMongoUri(),
    };
  }

  private getMongoUri(): string {
    return `mongodb://${this.getString('MONGO_USERNAME')}:${this.getString(
      'MONGO_PASSWORD',
    )}@${this.getString('MONGO_HOST')}:${this.getNumber(
      'MONGO_PORT',
    )}/${this.getString('MONGO_NAME')}`;
  }

  getMockAuthUser(): IAuthParams {
    return {
      id: randomUUID(),
      username: this.getString('TESTE_API_USER'),
      password: this.getString('TESTE_API_PASS'),
    };
  }
}
