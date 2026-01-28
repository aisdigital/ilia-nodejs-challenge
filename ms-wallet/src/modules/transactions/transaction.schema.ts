import { z } from 'zod';
import { TransactionType } from './transaction.model';

//Create Transaction and Response Schema
export const createTransactionSchema = z.object({
  user_id: z.string().uuid({ message: 'Invalid user ID format' }),
  amount: z.number().refine(val => val !== 0, {
    message: 'Amount cannot be zero',
  }),
  type: z.nativeEnum(TransactionType, {
    message: 'Type must be CREDIT or DEBIT',
  }),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;

export const transactionResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  created_at: z.date(),
});

export type TransactionResponseDTO = z.infer<typeof transactionResponseSchema>;


//List Transactions Query Schema
export const listTransactionsQuerySchema = z.object({
  type: z.nativeEnum(TransactionType).optional(),
});

export type ListTransactionsQueryDTO = z.infer<typeof listTransactionsQuerySchema>;


//Balance Response Schema
export const balanceResponseSchema = z.object({
  amount: z.number(),
});

export type BalanceResponseDTO = z.infer<typeof balanceResponseSchema>;