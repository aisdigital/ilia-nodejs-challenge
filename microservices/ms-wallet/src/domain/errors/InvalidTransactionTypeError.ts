export class InvalidTransactionTypeError extends Error {
  constructor(message: string = 'Invalid transaction type') {
    super(message);
    this.name = 'InvalidTransactionTypeError';
  }
}
