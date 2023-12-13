import { TransactionType } from '@prisma/client';
import { z } from 'zod';

export const TransactionBodySchema = z.object({
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
});

export const TransactionSchema = TransactionBodySchema.extend({
  user_id: z.string(),
});

export type TransactionSchemaType = z.infer<typeof TransactionSchema>;
