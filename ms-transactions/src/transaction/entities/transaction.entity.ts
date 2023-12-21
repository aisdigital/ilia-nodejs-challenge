import { $Enums, Transaction } from '@prisma/client';

export class TransactionEntity implements Transaction {
  id: number;
  user_id: string;
  amount: bigint;
  type: $Enums.Operation;
}
