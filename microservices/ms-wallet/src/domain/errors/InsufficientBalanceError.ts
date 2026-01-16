export class InsufficientBalanceError extends Error {
  constructor(message: string = 'Insufficient balance') {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}
