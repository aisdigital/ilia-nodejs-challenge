import { Injectable } from '@nestjs/common';
import { TransactionEntity } from './entities/transaction.entity';
import { DatabaseService } from '../repository/database/database.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly database: DatabaseService) {}

  async createOneTransaction(data): Promise<TransactionEntity> {
    return await this.database.transaction.create({ data });
  }

  async getAllTransactions(): Promise<Array<TransactionEntity>> {
    return await this.database.transaction.findMany();
  }
}
