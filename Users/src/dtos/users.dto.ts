import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  public first_name: string;

  @IsString()
  public last_name: string;
}
