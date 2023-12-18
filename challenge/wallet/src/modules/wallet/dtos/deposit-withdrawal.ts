import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositWithdrawalDto {
  @ApiProperty({
    description: 'Amount to deposit or withdraw',
    type: Number,
    example: 100,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
