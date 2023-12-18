import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async getAllWallets(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async createWallet(balance: number): Promise<Wallet> {
    const wallet = this.walletRepository.create({ balance });
    return this.walletRepository.save(wallet);
  }

  async depositFunds(walletId: number, amount: number): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);
    wallet.balance += amount;
    return this.walletRepository.save(wallet);
  }

  async withdrawFunds(walletId: number, amount: number): Promise<Wallet> {
    const wallet = await this.findWalletById(walletId);

    if (wallet.balance < amount) {
      throw new NotFoundException('Insufficient funds');
    }

    wallet.balance -= amount;
    return this.walletRepository.save(wallet);
  }

  private async findWalletById(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne(id);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }
}
