import { validationMiddleware } from '../../utils/error';
import { Router } from 'express';
import { createUser, listUsers, updateUser, getUserById, deleteUser } from './controller';
import { validateCreateUser, validateUpdateUser, validateUserId } from './validation';
import passport from 'passport';

const router = Router();

router
  .route('/')
  .post(validateCreateUser(), validationMiddleware, createUser)
  .get(passport.authenticate('jwt', { session: false }), validationMiddleware, listUsers);

router
  .route('/:user_id')
  .patch(
    passport.authenticate('jwt', { session: false }),
    validateUpdateUser(),
    validationMiddleware,
    updateUser,
  )
  .get(
    passport.authenticate('jwt', { session: false }),
    validateUserId(),
    validationMiddleware,
    getUserById,
  )
  .delete(
    passport.authenticate('jwt', { session: false }),
    validateUserId(),
    validationMiddleware,
    deleteUser,
  );

export default router;
