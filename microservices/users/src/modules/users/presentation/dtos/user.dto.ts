/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'The password must be at least 8 characters long.' })
  password: string;
}

// ----------------------
// 2. DTO de Requisição para Login (AuthRequest)
// ----------------------
export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

// ----------------------
// 3. DTO de Resposta (UsersResponse e AuthResponse)
// ----------------------
export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export class AuthResponseDto {
  user: UserResponseDto;
  access_token: string;
}
