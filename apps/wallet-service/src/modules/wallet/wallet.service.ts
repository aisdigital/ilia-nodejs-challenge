import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  async createWallet(data: CreateWalletDto): Promise<any> {
    const wallet = this.walletRepository.create(data);
    return this.walletRepository.save(wallet);
  }

  async findWalletByUserId(user_id: string): Promise<any> {
    const wallet = await this.walletRepository.findOne({
      where: { user_id },
      relations: ['transactions'],
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async createTransaction(data: CreateTransactionDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const walletRepo = queryRunner.manager.getRepository(Wallet);
      const transactionRepo = queryRunner.manager.getRepository(Transaction);

      const wallet = await walletRepo.findOne({ where: { id: data.wallet_id } });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (data.type === TransactionType.WITHDRAW) {
        if (wallet.balance < data.amount) {
          throw new Error('Insufficient balance');
        }
      }

      const transaction = transactionRepo.create(data);
      if (data.type === TransactionType.DEPOSIT) {
        wallet.balance += data.amount;
      } else if (data.type === TransactionType.WITHDRAW) {
        wallet.balance -= data.amount;
      }

      await walletRepo.save(wallet);
      const saved = await transactionRepo.save(transaction);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(wallet_id: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { wallet_id },
      order: { created_at: 'DESC' },
    });
  }

  async getBalance(wallet_id: string): Promise<{ balance: number }> {
    const wallet = await this.walletRepository.findOne({ where: { id: wallet_id } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return { balance: wallet.balance };
  }
}
