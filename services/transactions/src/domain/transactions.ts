import { InvalidAmountError } from './errors/invalid-amount-error.js';
import { TransactionType } from './transaction-type.enum.js';

interface TransactionArguments {
  type: TransactionType;
  amount: number;
  userId: string;
}

export class Transaction {
  public readonly type: TransactionType;
  public readonly amount: number;
  public readonly userId: string;
  public readonly balanceChange: number;

  constructor({ type, amount, userId }: TransactionArguments) {
    this.validateAmount(amount);

    this.type = type;
    this.amount = amount;
    this.userId = userId;
    this.balanceChange = type === TransactionType.CREDIT ? amount : -amount;
  }

  private validateAmount(amount: number): void {
    if (amount < 0) {
      throw new InvalidAmountError();
    }
  }
}
