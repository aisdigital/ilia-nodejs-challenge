export class UnauthorizedError extends Error {
  constructor() {
    super('Access token is missing or invalid');
  }
}
