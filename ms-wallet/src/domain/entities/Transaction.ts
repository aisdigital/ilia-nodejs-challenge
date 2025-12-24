import { v4 as uuidv4 } from 'uuid';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export interface TransactionProps {
  id?: string;
  userId: string;
  amount: number;
  type: TransactionType;
  createdAt?: Date;
}

export class Transaction {
  private constructor(private props: TransactionProps) {
    this.validate();
  }

  public static create(props: TransactionProps): Transaction {
    return new Transaction({
      ...props,
      id: props.id || this.generateId(),
      createdAt: props.createdAt || new Date()
    });
  }

  public static restore(props: TransactionProps): Transaction {
    if (!props.id || !props.createdAt) {
      throw new Error('ID and createdAt are required for restoring a transaction');
    }
    return new Transaction(props);
  }

  private static generateId(): string {
    return uuidv4();
  }

  private validate(): void {
    if (!this.props.userId) {
      throw new Error('User ID is required');
    }

    if (this.props.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!Object.values(TransactionType).includes(this.props.type)) {
      throw new Error('Invalid transaction type');
    }
  }

  get id(): string {
    return this.props.id!;
  }

  get userId(): string {
    return this.props.userId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get createdAt(): Date {
    return this.props.createdAt!;
  }

  public toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      amount: this.amount,
      type: this.type,
      created_at: this.createdAt
    };
  }
}