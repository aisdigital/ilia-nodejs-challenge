import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';
import { TransactionType } from 'src/entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'User unique identifier (UUID)',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Amount of the transaction in cents (must be positive)',
    type: Number,
    example: 10000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1 cent' })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Type of the transaction',
    enum: TransactionType,
    example: TransactionType.CREDIT,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;
}
