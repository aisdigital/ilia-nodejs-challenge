import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateTransactionRepositoryDto,
  TransactionDto,
  TransactionType,
} from '../../../domain/dtos/transaction.dto';
import { TransactionRepositoryInterface } from '../../../domain/repositories/transaction.repository.interface';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';

@Injectable()
export class TypeOrmTransactionRepository
  implements TransactionRepositoryInterface
{
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly repository: Repository<TransactionOrmEntity>,
  ) {}

  async create(data: CreateTransactionRepositoryDto): Promise<TransactionDto> {
    const ormEntity = this.toOrmEntity(data);
    const savedEntity = await this.repository.save(ormEntity);
    return this.toDto(savedEntity);
  }

  async findById(id: string): Promise<TransactionDto | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? this.toDto(ormEntity) : null;
  }

  async findByUserId(userId: string, type?: TransactionType): Promise<TransactionDto[]> {
    const where: any = { userId };
    if (type) {
      where.type = type;
    }
    const ormEntities = await this.repository.find({ where });
    return ormEntities.map((entity) => this.toDto(entity));
  }

  async findAll(type?: TransactionType): Promise<TransactionDto[]> {
    const where = type ? { type } : {};
    const ormEntities = await this.repository.find({ where });
    return ormEntities.map((entity) => this.toDto(entity));
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.repository.query(
      `SELECT SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE -amount END) as balance
       FROM transactions
       WHERE user_id = $1`,
      [userId],
    );

    return result[0]?.balance !== null && result[0]?.balance !== undefined
      ? Number(result[0].balance)
      : 0;
  }

  private toDto(ormEntity: TransactionOrmEntity): TransactionDto {
    return {
      id: ormEntity.id,
      userId: ormEntity.userId,
      amount: ormEntity.amount,
      type: ormEntity.type as TransactionType,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    };
  }

  private toOrmEntity(
    data: CreateTransactionRepositoryDto | TransactionDto,
  ): TransactionOrmEntity {
    const ormEntity = new TransactionOrmEntity();
    ormEntity.id = data.id;
    ormEntity.userId = data.userId;
    ormEntity.amount = data.amount;
    ormEntity.type = data.type;
    ormEntity.createdAt = data.createdAt;
    ormEntity.updatedAt = data.updatedAt;
    return ormEntity;
  }
}
