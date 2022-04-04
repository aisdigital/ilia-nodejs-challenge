import { check, ValidationChain, param } from 'express-validator';
import UserModel from './models/User';
import mongoose from 'mongoose';

export const validateCreateUser = (): ValidationChain[] => [
  check('email')
    .exists()
    .withMessage({ id: 'required-email', message: 'Email is required' })
    .isEmail()
    .withMessage({ id: 'invalid-email', message: 'Format is not accepted' })
    .custom(
      (value) =>
        new Promise<void>(async (resolve, reject) => {
          const exists = await UserModel.exists({
            email: value,
          });
          if (exists) return reject();
          return resolve();
        }),
    )
    .withMessage({ id: 'duplicated-email', message: 'Email already in use' }),
  check('first_name')
    .exists()
    .withMessage({ id: 'required-first_name', message: 'First name is required' })
    .bail()
    .isString()
    .withMessage({ id: 'invalid-first_name', message: 'Format is not accepted' })
    .bail()
    .isLength({ min: 3 })
    .withMessage({ id: 'min-lenght', message: 'first name requires at least 3 characters' }),
  check('last_name')
    .exists()
    .withMessage({ id: 'required-last_name', message: 'Last name is required' })
    .bail()
    .isString()
    .withMessage({ id: 'invalid-last_name', message: 'Format is not accepted' })
    .bail()
    .isLength({ min: 3 })
    .withMessage({ id: 'min-lenght', message: 'Last name requires at least 3 characters' }),
  check('password')
    .exists()
    .withMessage({ id: 'required-password', message: 'Password is required' })
    .bail()
    .isString()
    .withMessage({ id: 'invalid-password', message: 'Format is not accepted' })
    .isLength({ min: 8 })
    .withMessage({ id: 'invalid-password', message: 'Min 8 characters' }),
];

export const validateUserId = (): ValidationChain[] => [
  param('user_id')
    .exists()
    .withMessage({ id: 'required-user_id', message: 'user_id is required' })
    .bail()
    .custom(
      (user_id) =>
        new Promise<void>(async (resolve, reject) => {
          if (mongoose.Types.ObjectId.isValid(user_id)) {
            const exists = await UserModel.exists({
              _id: user_id,
            });
            if (exists) return resolve();
          }
          return reject();
        }),
    )
    .withMessage({ id: 'invalid-user_id', message: 'No user with id' }),
];

export const validateUpdateUser = (): ValidationChain[] => [
  ...validateUserId(),
  check('email')
    .optional()
    .bail()
    .isEmail()
    .withMessage({ id: 'invalid-email', message: 'Format is not accepted' })
    .bail()
    .custom(
      (value, { req }) =>
        new Promise<void>(async (resolve, reject) => {
          const exists = await UserModel.findOne({
            email: value,
          });
          if (exists && exists._id.toString() !== req.params.user_id) return reject();
          return resolve();
        }),
    )
    .withMessage({ id: 'duplicated-email', message: 'Email already in use' }),
  check('first_name')
    .optional()
    .bail()
    .isString()
    .withMessage({ id: 'invalid-first_name', message: 'Format is not accepted' })
    .bail()
    .isLength({ min: 3 })
    .withMessage({ id: 'min-lenght', message: 'first name requires at least 3 characters' }),
  check('last_name')
    .optional()
    .bail()
    .isString()
    .withMessage({ id: 'invalid-last_name', message: 'Format is not accepted' })
    .bail()
    .isLength({ min: 3 })
    .withMessage({ id: 'min-lenght', message: 'Last name requires at least 3 characters' }),
  check('password')
    .optional()
    .bail()
    .isString()
    .withMessage({ id: 'invalid-password', message: 'Format is not accepted' })
    .bail()
    .isLength({ min: 8 })
    .withMessage({ id: 'invalid-password', message: 'Min 8 characters' }),
];
