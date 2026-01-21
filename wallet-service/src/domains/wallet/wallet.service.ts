import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { CreateTransactionRequestDTO } from './dto/createTransaction.dto';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async createTransaction(userId: number, dto: CreateTransactionRequestDTO) {
    return this.walletRepository.runTransaction(async (tx) => {
      const wallet = await this.walletRepository.findWallet(tx, userId);

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (dto.type === 'DEBIT' && wallet.balance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const newBalance =
        dto.type === 'CREDIT'
          ? wallet.balance + dto.amount
          : wallet.balance - dto.amount;

      await this.walletRepository.createTransaction(tx, {
        user_id: userId,
        amount: dto.amount,
        type: dto.type,
      });

      await this.walletRepository.updateBalance(tx, userId, newBalance);
    });
  }

  async listTransactions(type?: 'CREDIT' | 'DEBIT') {
    return await this.walletRepository.findAll(type);
  }

  async getBalance(userId: number) {
    const wallet = await this.walletRepository.getBalance(userId);

    if (!wallet) {
      throw new NotFoundException(`wallet for user ${userId} not found`);
    }

    return { amount: wallet.amount };
  }
}
