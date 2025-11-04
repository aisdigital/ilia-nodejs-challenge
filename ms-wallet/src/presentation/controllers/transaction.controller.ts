import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TransactionType } from '../../domain/dtos/transaction.dto';
import { TRANSACTION_REPOSITORY, TransactionRepositoryInterface } from '../../domain/repositories/transaction.repository.interface';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetAllTransactionsUseCase } from '../../application/use-cases/get-all-transactions.use-case';
import { GetBalanceUseCase } from '../../application/use-cases/get-balance.use-case';
import { GetTransactionUseCase } from '../../application/use-cases/get-transaction.use-case';
import { TransactionApplicationMapper } from '../../application/mappers/transaction-application.mapper';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CreateTransactionRequestDto } from '../dtos/create-transaction-request.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { TransactionMapper } from '../mappers/transaction.mapper';

@Controller()
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
    private readonly getBalanceUseCase: GetBalanceUseCase,
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepositoryInterface,
  ) {}

  @Post('transactions')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: CreateTransactionRequestDto,
  ): Promise<TransactionResponseDto> {
    const dto = TransactionMapper.toApplicationDto(body);
    const result = await this.createTransactionUseCase.execute(dto);
    return TransactionMapper.toResponseDto(result);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('type') type?: TransactionType,
  ): Promise<TransactionResponseDto[]> {
    const { userId } = req.user;
    const transactions = await this.transactionRepository.findByUserId(userId, type);
    return TransactionMapper.toResponseDtoList(
      transactions.map(t => TransactionApplicationMapper.toApplicationDto(t))
    );
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<TransactionResponseDto> {
    const result = await this.getTransactionUseCase.execute(id);
    return TransactionMapper.toResponseDto(result);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@Request() req): Promise<{ amount: number }> {
    const { userId } = req.user;
    const balance = await this.getBalanceUseCase.execute(userId);
    return { amount: balance };
  }
}
