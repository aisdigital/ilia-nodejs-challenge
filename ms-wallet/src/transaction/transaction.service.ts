import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(private readonly transactioRepository: TransactionRepository) {}

  async create(createTransactionDto: CreateTransactionDto) {
    return await this.transactioRepository.createOneTransaction(
      createTransactionDto,
    );
  }

  async findAll() {
    return await this.transactioRepository.getAllTransactions();
  }
}
