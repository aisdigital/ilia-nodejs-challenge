import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsString, Min } from 'class-validator';

export class CreateTransactionRequestDTO {
  @Expose()
  @IsString()
  user_id: string;

  @Expose()
  @IsInt()
  @Min(1)
  amount: number;

  @Expose()
  @IsEnum(['CREDIT', 'DEBIT'])
  type: 'CREDIT' | 'DEBIT';
}
