import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class AuthUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
