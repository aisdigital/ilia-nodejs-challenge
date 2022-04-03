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
  serialize: () => SerializedTransaction;
}

interface SerializedTransaction {
  _id: string;
  amount: number;
  type: keyof typeof TransactionType;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
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

TransactionSchema.methods.serialize = function (): SerializedTransaction {
  const obj = {
    _id: this._id,
    user_id: this.user_id,
    amount: this.amount,
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  return obj;
};

export default mongoose.model<Transaction>('Transaction', TransactionSchema);
