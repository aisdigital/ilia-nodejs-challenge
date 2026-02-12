export class WalletEntity {
  userId: string;
  balance: number;

  constructor(userId: string, balance: number = 0) {
    this.userId = userId;
    this.balance = balance;
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new Error('credit amount must be greater than zero');
    }
    this.balance += amount;
  }

  debit(amount: number): void {
    if (amount <= 0) {
      throw new Error('debit amount must be greater than zero');
    }
    this.balance -= amount;
  }

  hasBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}