export class InvalidAmountError extends Error {
  constructor(message: string = 'Amount must be greater than zero') {
    super(message);
    this.name = 'InvalidAmountError';
  }
}
