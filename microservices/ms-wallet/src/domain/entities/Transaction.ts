export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    userId: string;
    amount: number;
    type: TransactionType;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.amount = data.amount;
    this.type = data.type;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isDebit(): boolean {
    return this.type === TransactionType.DEBIT;
  }

  isCredit(): boolean {
    return this.type === TransactionType.CREDIT;
  }
}
