import { Document } from 'mongoose';
import {
  ITransaction,
  TransactionStatus,
  TransactionTypes,
} from '../interfaces/transactions.interfaces';

export class TransactionModel extends Document implements ITransaction {
  id?: string;
  user_id: string;
  amount: string;
  status: TransactionStatus;
  type: TransactionTypes;
}
