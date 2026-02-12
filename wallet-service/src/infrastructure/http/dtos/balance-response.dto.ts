import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponse {
  @ApiProperty({ example: 50000 })
  amount: number;
}
