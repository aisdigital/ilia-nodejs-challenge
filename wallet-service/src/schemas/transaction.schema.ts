import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().int('Amount must be an integer').positive('Amount must be positive').min(1, 'Amount must be at least 1'),
  type: z.enum(['CREDIT', 'DEBIT']),
}).strict();
