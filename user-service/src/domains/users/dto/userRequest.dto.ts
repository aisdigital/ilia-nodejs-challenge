import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class UserRequestDTO {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  first_name: string;

  @Expose()
  @IsString()
  last_name: string;
}
