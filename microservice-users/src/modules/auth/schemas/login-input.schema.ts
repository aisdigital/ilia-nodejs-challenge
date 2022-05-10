import { Exclude, Expose } from "@nestjs/class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "@nestjs/class-validator";

@Exclude()
export class LoginInputSchema {
  @Expose()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @Expose()
  @IsNotEmpty()
  password: string;
}
