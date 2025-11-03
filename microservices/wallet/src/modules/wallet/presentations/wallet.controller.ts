/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateTransactionUseCase,
  InvalidAmountError,
  InsufficientBalanceError,
  UserNotFoundError,
} from '../application/use-cases/create-transaction.use-case';
import {
  CreateTransactionDto,
  TransactionResponseDto,
  BalanceResponseDto,
} from './dtos/transaction.dto';
import { isLeft } from '../../../shared/either/Either';
import * as IWalletRepository from '../domain/repositories/IWalletRepository';
import { TransactionType } from '../domain/entities/Transaction';
import { JwtAuthGuard } from '../../../shared/auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly walletRepository: IWalletRepository.IWalletRepository,
  ) {}

  @Post('transactions')
  @HttpCode(200)
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @Req() req: any,
  ): Promise<TransactionResponseDto> {
    const userId = req.user.userId;

    const command = {
      userId: userId,
      amount: dto.amount,
      type: dto.type,
    };

    const result = await this.createTransactionUseCase.execute(command);

    if (isLeft(result)) {
      const error = result.left;

      if (error instanceof InvalidAmountError) {
        throw new BadRequestException(
          'Invalid amount: Amount must be a positive integer.',
        );
      }
      if (error instanceof InsufficientBalanceError) {
        throw new ForbiddenException(error.message);
      }
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }

    const transaction = result.right;

    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt as Date,
    };
  }

  @Get('balance')
  async getBalance(@Req() req: any): Promise<BalanceResponseDto> {
    const userId = req.user.userId;
    const result = await this.walletRepository.getBalanceByUserId(userId);
    return { amount: result.amount };
  }

  @Get('transactions')
  async getTransactions(
    @Req() req: any,
    @Query('type') type?: string,
  ): Promise<TransactionResponseDto[]> {
    const userId = req.user.userId;

    const transactionType = type?.toUpperCase() as TransactionType;
    if (type && !(transactionType in TransactionType)) {
      throw new BadRequestException(
        'Invalid transaction type. Must be CREDIT or DEBIT.',
      );
    }

    const transactions = await this.walletRepository.findTransactionsByUserId(
      userId,
      transactionType,
    );

    return transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      amount: t.amount,
      type: t.type,
      createdAt: t.createdAt as Date,
    }));
  }
}
