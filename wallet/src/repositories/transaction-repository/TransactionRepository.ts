import { TransactionEntity } from "@entities/TransactionEntity";
import { ITransactionRepository } from "./ITransactionRepository";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

export class TransactionRepository implements ITransactionRepository {
  async save(amount: number, type: string): Promise<TransactionEntity> {
    return await new PrismaClient().transactions.create({
      data: {
        amount,
        type,
        id: randomBytes(16).toString("hex"),
      },
    });
  }

  async findAllTransaction(): Promise<TransactionEntity[]> {
    return await new PrismaClient().transactions.findMany();
  }

  async findTransaction(type: string): Promise<TransactionEntity[]> {
    const activeTransactions = await new PrismaClient().transactions.findMany({
      where: { type },
    });
    return activeTransactions;
  }
  async findBalance(user_id: string): Promise<TransactionEntity[]> {
    return await new PrismaClient().transactions.findMany({ where: { user_id } });
  }

  async findAllBalances(): Promise<TransactionEntity[]> {
    return await new PrismaClient().transactions.findMany();
  }
}
