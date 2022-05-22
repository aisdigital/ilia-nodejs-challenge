import { TransactionType } from '@/interfaces/transactions.interface';
import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  public user_id: string;

  @IsNumber()
  @IsNotEmpty()
  public amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  public type: string;
}
