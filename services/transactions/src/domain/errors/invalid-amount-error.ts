export class InvalidAmountError extends Error {
  constructor() {
    super('Invalid transaction amount');
  }
}
