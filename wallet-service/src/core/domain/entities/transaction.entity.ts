import { TransactionType } from '../enum/transaction-type.enum';

export class TransactionEntity {
  id?: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: {
    id?: string;
    user_id: string;
    amount: number;
    type: TransactionType;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.user_id = props.user_id;
    this.amount = props.amount;
    this.type = props.type;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this.user_id) {
      throw new Error('user_id is required');
    }

    if (!this.amount || this.amount <= 0) {
      throw new Error('amount must be greater than zero');
    }

    if (!Object.values(TransactionType).includes(this.type)) {
      throw new Error('invalid transaction type');
    }
  }

  isCredit(): boolean {
    return this.type === TransactionType.CREDIT;
  }

  isDebit(): boolean {
    return this.type === TransactionType.DEBIT;
  }
}
