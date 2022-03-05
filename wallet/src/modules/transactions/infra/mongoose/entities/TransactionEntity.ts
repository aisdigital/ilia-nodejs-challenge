import mongoose, { Document } from 'mongoose';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
export interface ITransaction extends Document {
  user_id: string;
  amount: number;
  type: TransactionType;
}

const TransactionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ['CREDIT', 'DEBIT'],
  },
});

export default mongoose.model<ITransaction>('Transactions', TransactionSchema);
