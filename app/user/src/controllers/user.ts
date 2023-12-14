import { Router } from 'express';
import { UserRequestSchema } from '../types/user';
import {
  deleteUser,
  getUserById,
  getUsers,
  register,
  updateUser,
} from '../services/user';
import { badRequest, isBoom } from '@hapi/boom';
import { ensureAuth } from '../middlewares/auth';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const UserController = Router();

UserController.post('/', async (req, res) => {
  try {
    const user = req.body;

    const parsedUser = UserRequestSchema.safeParse(user);

    if (!parsedUser.success) {
      return res
        .status(400)
        .json(badRequest('Invalid user data', parsedUser.error));
    }

    const createdUser = await register(user);

    return res.status(201).json(createdUser);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(400).json(badRequest('Email already exists'));
      }
    }

    if (isBoom(err)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(400).json(err);
  }
});

UserController.get('/', ensureAuth.Authenticated, async (req, res) => {
  try {
    const users = await getUsers();

    return res.status(200).json(users);
  } catch (err) {
    if (isBoom(err)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(400).json(err);
  }
});

UserController.get('/:id', ensureAuth.Authenticated, async (req, res) => {
  const users = await getUserById(req.params.id);

  return res.status(200).json(users);
});

UserController.put('/:id', ensureAuth.Authenticated, async (req, res) => {
  try {
    const user = req.body;

    const parsedUser = UserRequestSchema.safeParse(user);

    if (!parsedUser.success) {
      return res
        .status(400)
        .json(badRequest('Invalid user data', parsedUser.error));
    }

    const users = await updateUser({ ...user, id: req.params.id });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(400).json(err);
  }
});

UserController.delete('/:id', ensureAuth.Authenticated, async (req, res) => {
  try {
    await deleteUser(req.params.id);

    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return res.status(400).json(badRequest('User not found'));
      }
    }
    if (isBoom(err)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
    return res.status(400).json(err);
  }
});
