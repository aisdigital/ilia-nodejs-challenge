import { z } from 'zod';

// Register/Create User Schema
export const createUserSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;

// Update User Schema
export const updateUserSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

// User Response Schema 
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().nullable(),
});

export type UserResponseDTO = z.infer<typeof userResponseSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// Auth Response Schema
export const authResponseSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
});

export type AuthResponseDTO = z.infer<typeof authResponseSchema>;
