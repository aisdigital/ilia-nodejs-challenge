import { Schema } from 'mongoose';

export const TransactionSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});
