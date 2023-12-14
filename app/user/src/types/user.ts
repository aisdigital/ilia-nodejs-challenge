import { z } from 'zod';

export const UserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
});

export type UserRequestSchemaType = z.infer<typeof UserRequestSchema>;
