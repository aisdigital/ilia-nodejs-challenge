import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Operation } from '../transaction.interface';

export class CreateTransactionDto {
  @IsNotEmpty()
  user_id: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(Operation)
  type: Operation;
}
