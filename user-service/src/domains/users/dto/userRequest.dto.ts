import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class UserRequestDTO {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  firstName: string;

  @Expose()
  @IsString()
  lastName: string;
}
