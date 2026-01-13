export class Wallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public balance: number,
    public readonly createdAt: Date
  ) {}
}