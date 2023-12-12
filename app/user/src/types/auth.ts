import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

export const AuthenticatedUserSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserSchema>;
