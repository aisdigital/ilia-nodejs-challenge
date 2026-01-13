export type TransactionType = "CREDIT" | "DEBIT";

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly description: string,
    public readonly createdAt: Date
  ) {}
}
