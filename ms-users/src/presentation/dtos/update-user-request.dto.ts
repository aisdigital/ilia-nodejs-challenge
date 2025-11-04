import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
