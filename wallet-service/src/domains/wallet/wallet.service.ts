import { Injectable } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { Transaction } from './entity/transaction.entity';

@Injectable()
export class WalletService {
  constructor(private readonly repository: WalletRepository) {}

  createTransaction(transaction: Transaction) {
    return this.repository.create(transaction);
  }

  listTransactions(type?: 'CREDIT' | 'DEBIT') {
    return this.repository.findAll(type);
  }

  getBalance() {
    return this.repository.getBalance();
  }
}
