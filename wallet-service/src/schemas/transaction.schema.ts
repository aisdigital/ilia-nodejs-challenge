import { z } from 'zod';
import { TRANSACTION_TYPES } from '../constants/transaction.constants';

const transactionTypeValues = [TRANSACTION_TYPES.CREDIT, TRANSACTION_TYPES.DEBIT] as const;

export const createTransactionSchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive').min(1, 'Amount must be at least 1'),
  type: z.enum(transactionTypeValues),
}).strict();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

