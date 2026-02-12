import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { TransactionType } from '../../../core/domain/enum/transaction-type.enum';

export class CreateTransactionRequest {
  @ApiProperty({ example: 10000, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.CREDIT })
  @IsEnum(TransactionType)
  type: TransactionType;
}
