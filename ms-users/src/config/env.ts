import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3002),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_SECRET: z.string().min(10),
  JWT_SECRET_INTERNAL: z.string().min(10),
  GRPC_WALLET_HOST: z.string(),
  GRPC_WALLET_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', z.treeifyError(_env.error));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
