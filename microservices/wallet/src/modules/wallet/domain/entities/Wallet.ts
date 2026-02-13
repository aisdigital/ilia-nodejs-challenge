export class Wallet {
  private readonly _userId: string;

  private constructor(userId: string) {
    this._userId = userId;
  }

  public static create(userId: string): Wallet {
    if (!userId) {
      throw new Error('User ID is required for Wallet entity.');
    }
    return new Wallet(userId);
  }

  get userId(): string {
    return this._userId;
  }
}
