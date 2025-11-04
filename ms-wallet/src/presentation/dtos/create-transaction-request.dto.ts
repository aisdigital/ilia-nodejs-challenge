import { IsEnum, IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { TransactionType } from '../../domain/dtos/transaction.dto';

export class CreateTransactionRequestDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;
}
