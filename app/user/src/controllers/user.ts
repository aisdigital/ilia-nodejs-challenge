import { Router } from 'express';
import { RegisterSchema } from '../types/user';
import { register } from '../services/user';
import { badData } from '@hapi/boom';

export const UserController = Router();

UserController.post('/', async (req, res) => {
  const user = req.body;

  const parsedUser = RegisterSchema.safeParse(user);

  if (!parsedUser.success) {
    throw badData('Invalid user data');
  }

  const createdUser = await register(user);

  return res.status(201).json(createdUser);
});
