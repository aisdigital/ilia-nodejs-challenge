import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionType } from '../../../../core/domain/enum/transaction-type.enum';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ type: String, required: true, enum: TransactionType })
  type: TransactionType;

  createdAt?: Date;

  updatedAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({ user_id: 1, createdAt: -1 });
TransactionSchema.index({ user_id: 1, type: 1 });
