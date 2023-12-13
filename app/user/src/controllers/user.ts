import { Router } from 'express';
import { UserRequestSchema } from '../types/user';
import {
  deleteUser,
  getUserById,
  getUsers,
  register,
  updateUser,
} from '../services/user';
import { badRequest } from '@hapi/boom';
import { ensureAuth } from '../middlewares/auth';

export const UserController = Router();

UserController.post('/', async (req, res) => {
  const user = req.body;

  const parsedUser = UserRequestSchema.safeParse(user);

  if (!parsedUser.success) {
    return res
      .status(400)
      .json(badRequest('Invalid user data', parsedUser.error));
  }

  const createdUser = await register(user);

  return res.status(201).json(createdUser);
});

UserController.get('/', ensureAuth.Authenticated, async (req, res) => {
  const users = await getUsers();

  return res.status(200).json(users);
});

UserController.get('/:id', ensureAuth.Authenticated, async (req, res) => {
  const users = await getUserById(req.params.id);

  return res.status(200).json(users);
});

UserController.put('/:id', ensureAuth.Authenticated, async (req, res) => {
  const user = req.body;

  const parsedUser = UserRequestSchema.safeParse(user);

  if (!parsedUser.success) {
    return res
      .status(400)
      .json(badRequest('Invalid user data', parsedUser.error));
  }

  const users = await updateUser({ ...user, id: req.params.id });

  return res.status(200).json(users);
});

UserController.delete('/:id', ensureAuth.Authenticated, async (req, res) => {
  try {
    await deleteUser(req.params.id);

    return res.status(200);
  } catch (err) {
    return res.status(400).json(err);
  }
});
