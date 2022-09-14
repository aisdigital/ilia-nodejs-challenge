import { Document, Types } from 'mongoose'

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface SerializedTransaction {
  _id: string;
  price: number;
  type: TransactionType;
  paying_user_id: Types.ObjectId;
  receiving_user_id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Transaction = SerializedTransaction & Document & { 
  serialize(): SerializedTransaction
}