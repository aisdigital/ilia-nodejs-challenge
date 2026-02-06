import { z } from 'zod';

export const createWalletUserSchema = z.object({
  user_id: z.string().uuid('user_id must be a valid UUID'),
}).strict();

export type CreateWalletUserInput = z.infer<typeof createWalletUserSchema>;
