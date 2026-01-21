import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransactionRequestDTO {
  @Expose()
  @IsNumber()
  user_id: number;

  @Expose()
  @IsInt()
  @Min(1)
  amount: number;

  @Expose()
  @IsEnum(['CREDIT', 'DEBIT'])
  type: 'CREDIT' | 'DEBIT';
}
