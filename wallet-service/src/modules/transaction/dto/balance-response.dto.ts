import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({
    description:
      'Total balance consolidated from credit and debit transactions',
    type: Number,
  })
  amount: number;
}
