import { randomUUID } from "crypto";
import { WalletRepository } from "./wallet.repository.js";
import { CreateTransactionDTO} from "./dto/create-transaction.dto.js";
import { Transaction } from "./entities/transaction.entity.js";
import { Wallet } from "./entities/wallet.entity.js";
import { TransactionType } from "./entities/transaction.entity.js";

export class WalletService {
  constructor(private readonly repository: WalletRepository) {}

  async createTransaction(dto: CreateTransactionDTO): Promise<void> {
    const userId = dto.user_id;

    let wallet = await this.repository.findWalletByUser(userId);

    if (!wallet) {
      wallet = new Wallet(randomUUID(), userId, 0, new Date());
      await this.repository.createWallet(wallet);
    }

    wallet.balance =
      dto.type === "CREDIT"
        ? wallet.balance + dto.amount
        : wallet.balance - dto.amount;

    await this.repository.updateWalletBalance(wallet.id, wallet.balance);

    const transaction = new Transaction(
      randomUUID(),
      wallet.id,
      dto.type,
      dto.amount,
      "", 
      new Date()
    );

    await this.repository.createTransaction(transaction);
  }

  async listTransactions(
    userId: string | undefined,
    type?: TransactionType
  ) {
    if (!userId) return [];

    const wallet = await this.repository.findWalletByUser(userId);
    if (!wallet) return [];

    return this.repository.findTransactionsByWallet(wallet.id, type);
  }

  async getBalance(userId: string | undefined): Promise<number> {
    if (!userId) return 0;
   
    return this.repository.getBalanceByUser(userId);
  }
}
