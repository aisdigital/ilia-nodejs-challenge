import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/entities/transaction.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { BalanceService } from './balance.service';
import { ConfigService } from '@nestjs/config';
import { generateRequestHash } from 'src/util/hash.util';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly balanceService: BalanceService,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async getTransactions(type?: TransactionType): Promise<Transaction[]> {
    const query = this.transactionsRepository.createQueryBuilder('transaction');

    if (type) {
      query.where('transaction.type = :type', { type });
    }

    return query.orderBy('transaction.created_at', 'DESC').getMany();
  }

  private async findByRequestHash(hash: string): Promise<Transaction | null> {
    return this.transactionsRepository.findOne({
      where: { request_hash: hash },
    });
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Fingerprinting for avoiding duplicate transactions
    const requestHash = generateRequestHash(
      createTransactionDto,
      this.configService.get<number>('transaction.deduplicationWindowSeconds'),
    );

    const existingTransaction = await this.findByRequestHash(requestHash);

    if (existingTransaction) {
      this.logger.log(
        `Duplicate detected, returning existing transaction: ${existingTransaction.id}`,
      );

      if (existingTransaction.status === TransactionStatus.PENDING) {
        throw new ConflictException(
          'A similar transaction is being processed. Please wait.',
        );
      }

      return existingTransaction;
    }

    return await this.createTransactionWithRetry(
      createTransactionDto,
      requestHash,
    );
  }

  async createTransactionWithRetry(
    dto: CreateTransactionDto,
    requestHash: string,
    retryCount: number = 0,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      if (dto.type === TransactionType.DEBIT) {
        await this.validateBalance(queryRunner, dto.user_id, dto.amount);
      }

      const transaction = queryRunner.manager.create(Transaction, {
        ...dto,
        status: TransactionStatus.PENDING,
        request_hash: requestHash,
        retry_count: retryCount,
      });

      const saved = await queryRunner.manager.save(transaction);

      // Our custom business logic could go here (e.g., notifying other services, payment gateway calls, etc.)

      saved.status = TransactionStatus.COMPLETED;
      saved.processed_at = new Date();

      await queryRunner.manager.save(saved);
      await queryRunner.commitTransaction();

      this.logger.log(`Transaction created: ${saved.id}`);

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const isRetriableError = this.isRetriableError(error);
      const maxRetryAttempts = this.configService.get<number>(
        'transaction.maxRetryAttempts',
      );

      if (isRetriableError && retryCount < maxRetryAttempts) {
        this.logger.warn(
          `Retrying transaction creation (attempt ${retryCount + 1}/${maxRetryAttempts})`,
        );

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 100),
        );

        return this.createTransactionWithRetry(
          dto,
          requestHash,
          retryCount + 1,
        );
      }

      this.logger.error('Transaction creation failed', error);

      await this.saveFailedTransaction(dto, requestHash, error, retryCount);

      throw new InternalServerErrorException('Failed to process transaction');
    } finally {
      await queryRunner.release();
    }
  }

  private async validateBalance(
    queryRunner: QueryRunner,
    userId: string,
    debitAmount: number,
  ): Promise<void> {
    const currentBalance = await this.balanceService.getUserBalance(
      queryRunner,
      userId,
    );

    if (currentBalance < debitAmount) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${currentBalance}, Required: ${debitAmount}`,
      );
    }
  }

  /**
   * Save a failed transaction record for auditing purposes
   */
  private async saveFailedTransaction(
    dto: CreateTransactionDto,
    requestHash: string,
    error: any,
    retryCount: number,
  ): Promise<void> {
    try {
      const failedTransaction = this.transactionsRepository.create({
        ...dto,
        status: TransactionStatus.FAILED,
        request_hash: requestHash,
        retry_count: retryCount,
        error_message: error.message || 'Unknown error',
      });

      await this.transactionsRepository.save(failedTransaction);
    } catch (saveError) {
      this.logger.error('Failed to save failed transaction:', saveError);
    }
  }

  /**
   * Check if the error is retriable based on its code or message
   */
  private isRetriableError(error: any): boolean {
    const errorCode = error.code || '';
    const errorMessage = error.message || '';

    // PostgreSQL error codes for serialization failures and deadlocks
    const retriableCodes = [
      '40001', // serialization_failure
      '40P01', // deadlock_detected
      '08006', // connection_failure
      '08003', // connection_does_not_exist
    ];

    return (
      retriableCodes.includes(errorCode) ||
      errorMessage.includes('deadlock') ||
      errorMessage.includes('serialization') ||
      errorMessage.includes('could not serialize')
    );
  }
}
