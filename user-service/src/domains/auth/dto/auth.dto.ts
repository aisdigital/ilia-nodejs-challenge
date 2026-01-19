import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class AuthDTO {
  @Expose()
  @IsEmail()
  email!: string;

  @Expose()
  @IsString()
  password!: string;
}
