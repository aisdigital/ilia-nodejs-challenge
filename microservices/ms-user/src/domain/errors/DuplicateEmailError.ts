export class DuplicateEmailError extends Error {
  constructor(message: string = 'Email already in use') {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}
