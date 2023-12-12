import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
});

export const AuthenticatedUserSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
export type User = z.infer<typeof UserSchema>;
