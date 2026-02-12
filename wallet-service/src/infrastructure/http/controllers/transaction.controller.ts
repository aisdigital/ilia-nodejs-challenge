import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { CurrentUserData } from '../interfaces/current-user-data.interface';
import { TransactionService } from '../services/transaction.service';
import { TransactionType } from '../../../core/domain/enum/transaction-type.enum';
import { CreateTransactionRequest } from '../dtos/create-transaction-request.dto';
import { TransactionResponse } from '../dtos/transaction-response.dto';
import { BalanceResponse } from '../dtos/balance-response.dto';

@ApiTags('Transactions')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction created successfully',
    type: TransactionResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTransaction(
    @CurrentUser() user: CurrentUserData,
    @Body() request: CreateTransactionRequest,
  ): Promise<TransactionResponse> {
    const transaction = await this.transactionService.createTransaction(
      user.userId,
      request.amount,
      request.type,
    );

    return {
      id: transaction.id!,
      user_id: transaction.user_id,
      amount: transaction.amount,
      type: transaction.type,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all transactions' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TransactionType,
    description: 'Filter by transaction type',
  })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: [TransactionResponse],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listTransactions(
    @CurrentUser() user: CurrentUserData,
    @Query('type') type?: TransactionType,
  ): Promise<TransactionResponse[]> {
    const transactions = await this.transactionService.listTransactions(
      user.userId,
      type,
    );

    return transactions.map((t) => ({
      id: t.id!,
      user_id: t.user_id,
      amount: t.amount,
      type: t.type,
    }));
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Get consolidated balance',
    description:
      'Returns the consolidated balance calculated from CREDIT and DEBIT transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponse,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(
    @CurrentUser() user: CurrentUserData,
  ): Promise<BalanceResponse> {
    const balance = await this.transactionService.getBalance(user.userId);

    return {
      amount: balance.amount,
    };
  }
}
