import { Document } from 'mongoose'

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export interface SerializedTransaction {
  _id: string;
  price: number;
  type: TransactionType;
  paying_user_id: string;
  receiving_user_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Transaction = SerializedTransaction & Document & { 
  serialize(): SerializedTransaction
}