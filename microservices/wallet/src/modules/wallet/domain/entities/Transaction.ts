import { Amount, InvalidAmountError } from "../value-objects/Amount"

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
}

export interface TransactionProps {
  userId: string
  amount: Amount
  type: TransactionType
  createdAt?: Date
}

export class Transaction {
  private readonly _id: string
  private readonly props: TransactionProps

  private constructor(props: TransactionProps, id?: string) {
    this._id = id ?? crypto.randomUUID()
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date()
    }
  }

  public static create(props: Omit<TransactionProps, 'amount'> & { amount: number }, id?: string): Transaction | InvalidAmountError {
    const amountOrError = Amount.create(props.amount);

    if (amountOrError instanceof InvalidAmountError) {
      return amountOrError;
    }

    return new Transaction({
      ...props,
      amount: amountOrError,
    }, id);
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this.props.userId;
  }
  
  get amount(): number {
    return this.props.amount.getValue();
  }

  get type(): TransactionType {
    return this.props.type;
  }
  
  get createdAt(): Date | undefined{
    return this.props.createdAt;
  }
}