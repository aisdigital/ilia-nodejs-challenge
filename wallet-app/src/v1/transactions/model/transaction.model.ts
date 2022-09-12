import { Document } from 'mongoose';
import {
  ITransaction,
  TransactionTypes,
} from '../interfaces/transactions.interfaces';

export class TransactionModel extends Document implements ITransaction {
  id?: string;
  user_id: string;
  amount: string;
  type: TransactionTypes;
}
