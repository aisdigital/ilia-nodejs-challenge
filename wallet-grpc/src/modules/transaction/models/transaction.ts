import mongoose, { Schema } from 'mongoose'
import { SerializedTransaction, Transaction, TransactionType } from '../types'

const transactionSchema = new Schema<Transaction>(
  {
    price: {
      required: true,
      type: Number,
    },
    type: {
      required: true,
      type: String,
      enum: TransactionType,
    },
    paying_user_id: {
      required: true,
      type: String,
    },
    receiving_user_id: {
      required: true,
      type: String,
    }
  },
  { timestamps: true }
)

transactionSchema.methods.serialize = function(): SerializedTransaction {
  return {
    _id: this._id,
    price: this.price,
    type: this.type,
    paying_user_id: this.paying_user_id,
    receiving_user_id: this.receiving_user_id,
  }
}

const TransactionModel = mongoose.model<Transaction>('Transaction', transactionSchema)
export { TransactionModel }