import { z } from 'zod';

export const TransactionBodySchema = z.object({
  amount: z.number(),
  type: z.enum(['DEBIT', 'CREDIT']),
});
