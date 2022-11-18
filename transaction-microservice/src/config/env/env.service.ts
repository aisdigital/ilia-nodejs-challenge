import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return +this.configService.get<string>('app.appPort');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('app.jwtSecret');
  }

  get transactionMSApi(): string {
    return this.configService.get<string>('app.transactionMSApi.baseUrl');
  }
}
