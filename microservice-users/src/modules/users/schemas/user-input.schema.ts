import { Exclude, Expose } from "@nestjs/class-transformer";
import { IsOptional, IsString } from "@nestjs/class-validator";

@Exclude()
export class UserInputSchema {
  @Expose()
  @IsString()
  @IsOptional()
  id?: string;

  @Expose()
  @IsString()
  first_name: string;

  @Expose()
  @IsString()
  last_name: string;

  @Expose()
  @IsString()
  password: string;

  @Expose()
  @IsString()
  email: string;
}
