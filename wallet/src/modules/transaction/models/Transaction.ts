import mongoose, { Document, Schema } from 'mongoose';
import { UserModel } from '../../../database/mongoose';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface Transaction extends Document {
  user_id: mongoose.SchemaDefinitionProperty<string>;
  amount: number;
  type: keyof typeof TransactionType;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema<Transaction> = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: UserModel, required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionType),
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<Transaction>('Transaction', TransactionSchema);
