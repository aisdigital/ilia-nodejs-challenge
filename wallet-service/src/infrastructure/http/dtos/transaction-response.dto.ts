import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../../core/domain/enum/transaction-type.enum';

export class TransactionResponse {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  user_id: string;

  @ApiProperty({ example: 10000 })
  amount: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.CREDIT })
  type: TransactionType;
}
