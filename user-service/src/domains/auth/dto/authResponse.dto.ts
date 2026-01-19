import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

export class AuthResponseDTO {
  @Expose()
  @Type(() => User)
  @ValidateNested()
  user!: User;

  @Expose()
  @IsString()
  access_token!: string;
}

export class User {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  email!: string;

  @Expose()
  @IsString()
  first_name!: string;

  @Expose()
  @IsString()
  last_name!: string;
}
