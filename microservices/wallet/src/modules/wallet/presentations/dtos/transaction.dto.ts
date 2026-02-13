/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsIn, IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { TransactionType } from '../../domain/entities/Transaction';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsIn([TransactionType.CREDIT, TransactionType.DEBIT])
  type: TransactionType;
}

export class TransactionResponseDto {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
}

export class BalanceResponseDto {
  amount: number;
}
