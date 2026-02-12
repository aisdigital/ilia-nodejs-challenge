import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionType } from 'src/shared/@types/TransactionType';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: string;
}
