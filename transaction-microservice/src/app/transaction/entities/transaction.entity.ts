import { Decimal } from '@prisma/client/runtime';

export class Transaction {
  userId: number;
  type: string;
  amount: Decimal;
}
