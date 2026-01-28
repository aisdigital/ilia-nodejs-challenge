import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3001),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_SECRET_INTERNAL: z.string().min(10),
  GRPC_PORT: z.string().transform(Number).default(50051),
})

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', z.treeifyError(_env.error));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;