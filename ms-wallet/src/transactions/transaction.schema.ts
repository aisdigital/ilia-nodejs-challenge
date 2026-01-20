import { z } from 'zod';
import { TransactionType } from './transaction.model';

//Create Transaction and Response Schema
export const createTransactionSchema = z.object({
  user_id: z.uuidv4('Invalid user ID format'),
  amount: z.number(),
  type: z.enum(TransactionType, {
    error: 'Type must be CREDIT or DEBIT',
  }),
});

export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;

export const transactionResponseSchema = z.object({
  id: z.uuidv4(),
  user_id: z.uuidv4(),
  amount: z.number(),
  type: z.enum(TransactionType),
  created_at: z.date(),
});

export type TransactionResponseDTO = z.infer<typeof transactionResponseSchema>;


//List Transactions Query Schema
export const listTransactionsQuerySchema = z.object({
  type: z.enum(TransactionType).optional(),
});

export type ListTransactionsQueryDTO = z.infer<typeof listTransactionsQuerySchema>;


//Balance Response Schema
export const balanceResponseSchema = z.object({
  balance: z.number(),
});

export type BalanceResponseDTO = z.infer<typeof balanceResponseSchema>;