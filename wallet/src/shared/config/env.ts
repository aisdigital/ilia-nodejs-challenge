import { ValidationError } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, NotEquals, validateSync } from 'class-validator';

class Env {
  @IsString()
  @IsNotEmpty()
  @NotEquals('mongo_database_url_example')
  mongoUrl: string;
}

export const env: Env = plainToInstance(Env, {
  mongoUrl: process.env.MONGO_DATABASE_URL,
});

const errors: ValidationError[] = validateSync(env);

if (errors.length > 0) {
  throw new Error(JSON.stringify(errors, null, 2));
}
