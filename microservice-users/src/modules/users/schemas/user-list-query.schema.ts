import { Exclude, Expose } from "@nestjs/class-transformer";
import { IsOptional, IsString } from "@nestjs/class-validator";

@Exclude()
export class UserListQuerySchema {
  @Expose()
  @IsOptional()
  @IsString()
  first_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  last_name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  email?: string;
}
