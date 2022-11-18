import { Decimal } from '@prisma/client/runtime';
import { ValidTransactionType } from '@shared/validators/ValidTransactionType';
import { IsNumber, Validate } from 'class-validator';
import { Transaction } from '../entities/transaction.entity';

export class CreateTransactionDto extends Transaction {
  @IsNumber()
  userId: number;

  @Validate(ValidTransactionType)
  type: string;

  @IsNumber()
  amount: Decimal;
}
