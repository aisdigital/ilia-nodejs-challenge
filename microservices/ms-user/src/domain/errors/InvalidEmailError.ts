export class InvalidEmailError extends Error {
  constructor(message: string = 'Invalid email address') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}
