import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  jwtSecret: string;
}

export default registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '3002'),
  jwtSecret: process.env.JWT_SECRET || 'ILIACHALLENGE',
}));
