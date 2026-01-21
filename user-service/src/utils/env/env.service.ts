import { Expose, plainToInstance } from 'class-transformer';
import { IsString, validateSync } from 'class-validator';

export interface IEnvService {
  FIREBASE_CREDENTIALS: string;
  DATABASE_URL: string;
  WALLET_DATABASE_URL: string;
  JWT_PRIVATE_KEY: string;
  JWT_INTERNAL_KEY: string;
  FIREBASE_API_KEY: string;
}

export class EnvSchema {
  @Expose()
  @IsString()
  FIREBASE_CREDENTIALS!: string;

  @Expose()
  @IsString()
  FIREBASE_API_KEY!: string;

  @Expose()
  @IsString()
  DATABASE_URL!: string;

  @Expose()
  @IsString()
  WALLET_DATABASE_URL!: string;

  @Expose()
  @IsString()
  JWT_PRIVATE_KEY!: string;

  @Expose()
  @IsString()
  JWT_INTERNAL_KEY!: string;
}

export function validate(env: Record<string, unknown>): EnvSchema {
  const envService = plainToInstance(EnvSchema, env, {
    excludeExtraneousValues: true,
  });

  const errors = validateSync(envService);

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return envService;
}
