import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtSecretInternal: string;
}

export default registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || 'ILIACHALLENGE',
  jwtSecretInternal: process.env.JWT_SECRET_INTERNAL || 'ILIACHALLENGE_INTERNAL',
}));
