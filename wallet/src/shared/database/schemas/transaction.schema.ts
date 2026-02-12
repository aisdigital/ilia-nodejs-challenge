import mongoose from 'mongoose';
import { TransactionType } from 'src/shared/@types/TransactionType';

export const TransactionSchema = new mongoose.Schema({
  user_id: {
    type: String,
    require: true,
  },
  amount: {
    type: Number,
    require: true,
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    require: true,
    default: TransactionType.CREDIT,
  },
});
