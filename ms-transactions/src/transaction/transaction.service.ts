import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
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

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
