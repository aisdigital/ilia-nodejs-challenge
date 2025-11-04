import { CreateTransactionDto } from '../../application/dtos/create-transaction.dto';
import { TransactionDto } from '../../application/dtos/transaction.dto';
import { CreateTransactionRequestDto } from '../dtos/create-transaction-request.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';

export class TransactionMapper {
  static toApplicationDto(
    requestDto: CreateTransactionRequestDto,
  ): CreateTransactionDto {
    return {
      userId: requestDto.userId,
      amount: requestDto.amount,
      type: requestDto.type,
    };
  }

  static toResponseDto(transactionDto: TransactionDto): TransactionResponseDto {
    return {
      id: transactionDto.id,
      userId: transactionDto.userId,
      amount: transactionDto.amount,
      type: transactionDto.type,
      createdAt: transactionDto.createdAt,
      updatedAt: transactionDto.updatedAt,
    };
  }

  static toResponseDtoList(
    transactionDtos: TransactionDto[],
  ): TransactionResponseDto[] {
    return transactionDtos.map((dto) => this.toResponseDto(dto));
  }
}
