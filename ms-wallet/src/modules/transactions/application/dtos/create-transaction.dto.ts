import { IsEnum, IsInt, IsString, Min } from 'class-validator';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class CreateTransactionDto {
  @IsString()
  user_id!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;
}
