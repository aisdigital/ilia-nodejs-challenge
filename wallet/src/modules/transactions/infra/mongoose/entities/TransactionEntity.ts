import mongoose, { Document } from 'mongoose';

enum TransactionType {
  CREDIT,
  DEBIT
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
    enum : ['CREDIT','DEBIT'],
  },
});

export default mongoose.model<ITransaction>('Transactions', TransactionSchema);
