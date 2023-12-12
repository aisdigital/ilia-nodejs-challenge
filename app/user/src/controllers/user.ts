import { Router } from 'express';
import { RegisterSchema } from '../types/user';
import { getUsers, register } from '../services/user';
import { badData } from '@hapi/boom';
import { ensureAuth } from '../middlewares/auth';

export const UserController = Router();

UserController.post('/', async (req, res) => {
  const user = req.body;

  const parsedUser = RegisterSchema.safeParse(user);

  if (!parsedUser.success) {
    return res.status(422).json(badData('Invalid user data', parsedUser.error));
  }

  const createdUser = await register(user);

  return res.status(201).json(createdUser);
});

UserController.get('/', ensureAuth.Authenticated, async (req, res) => {
  const users = await getUsers();

  return res.status(200).json(users);
});
