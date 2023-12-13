import { TransactionType } from '@prisma/client';
import { z } from 'zod';

const TransactionEnum = z.nativeEnum(TransactionType);

export const TransactionBodySchema = z.object({
  amount: z.number(),
  type: TransactionEnum,
});

export const TransactionSchema = TransactionBodySchema.extend({
  user_id: z.string(),
});

export const ListTransactionQuerySchema = z.object({
  type: TransactionEnum.optional(),
});

const ListTransactionQueryType = ListTransactionQuerySchema.extend({
  user_id: z.string(),
});

export type TransactionSchemaType = z.infer<typeof TransactionSchema>;
export type ListTransactionQuerySchemaType = z.infer<
  typeof ListTransactionQueryType
>;
