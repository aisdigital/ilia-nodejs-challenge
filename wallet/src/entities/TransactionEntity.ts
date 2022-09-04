export class TransactionEntity {
  _id?: string;
  user_id?: string;
  amount: number;
  type: string;

  constructor(amount: number, type: string, user_id: string, _id: string) {
    this.amount = amount;
    this.type = type;
    this.user_id = user_id;
    this._id = _id;
  }
}
