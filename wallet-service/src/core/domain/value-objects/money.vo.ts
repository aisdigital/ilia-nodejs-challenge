export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    if (amount < 0) {
      throw new Error('money amount cannot be negative');
    }
    this._amount = amount;
  }

  get amount(): number {
    return this._amount;
  }

  add(other: Money): Money {
    return new Money(this._amount + other.amount);
  }

  subtract(other: Money): Money {
    const result = this._amount - other.amount;
    if (result < 0) {
      throw new Error('insufficient funds');
    }
    return new Money(result);
  }

  isGreaterThan(other: Money): boolean {
    return this._amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this._amount < other.amount;
  }

  equals(other: Money): boolean {
    return this._amount === other.amount;
  }
}
