import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './services/transaction.service';
import { Transaction, TransactionType } from 'src/entities/transaction.entity';
import { BalanceService } from './services/balance.service';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly balanceService: BalanceService,
  ) {}

  @ApiOperation({
    summary: 'Create a new transaction',
    description: `
      Creates a new transaction with automatic retry support and concurrency control.
      
      **Duplicate Detection**: The system automatically detects duplicate requests 
      based on a fingerprint (user_id + type + amount + time window). If a similar 
      transaction was created within the last 30 seconds, it will return the existing 
      transaction instead of creating a duplicate.
      
      **Concurrency Control**: Uses database-level locks to prevent race conditions 
      when multiple requests arrive simultaneously for the same user.
      
      **Automatic Retry**: Failed transactions due to temporary issues (deadlocks, 
      serialization failures) are automatically retried up to 3 times with 
      exponential backoff.
      
      **Balance Validation**: For DEBIT transactions, the system validates that 
      the user has sufficient balance before processing. Uses row-level locks 
      to prevent double spending.
      
      **Important**: This endpoint is safe to retry. If you receive a timeout or 
      network error, you can safely retry the same request and the system will 
      detect and prevent duplicates.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction created successfully',
    type: Transaction,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or insufficient balance',
    schema: {
      example: {
        statusCode: 400,
        message: 'Insufficient balance. Available: 5000, Required: 10000',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - A similar transaction is currently being processed',
    schema: {
      example: {
        statusCode: 409,
        message:
          'A similar transaction is currently being processed. Please wait a moment.',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error - Failed to process transaction after retries',
  })
  @HttpCode(HttpStatus.OK)
  @Post()
  createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // TODO: Check if userId exists in the user service
    return this.transactionsService.createTransaction(createTransactionDto);
  }

  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
    type: [Transaction],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'type', enum: TransactionType })
  @Get()
  getTransactions(
    @Query('type') type?: TransactionType,
  ): Promise<Transaction[]> {
    return this.transactionsService.getTransactions(type);
  }

  @ApiOperation({
    summary: 'Get consolidated balance from all transactions (credit/debit)',
  })
  @ApiResponse({
    status: 200,
    description: 'Consolidated balance',
    type: BalanceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('balance')
  async getBalance(): Promise<BalanceResponseDto> {
    const amount = await this.balanceService.getTotalBalance();

    return { amount };
  }
}
