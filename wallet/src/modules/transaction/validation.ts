import { UserModel } from '../../database/mongoose';
import { check, ValidationChain, query, CustomValidator } from 'express-validator';
import mongoose from 'mongoose';
import { TransactionType } from './models/Transaction';

const ValidUserId: CustomValidator = (user_id) =>
  new Promise<void>(async (resolve, reject) => {
    if (mongoose.Types.ObjectId.isValid(user_id)) {
      const exists = await UserModel.exists({
        _id: user_id,
      });
      if (exists) return resolve();
    }
    return reject();
  });

export const validateCreateTransaction = (): ValidationChain[] => [
  check('user_id')
    .exists()
    .withMessage({ id: 'required-user_id', message: 'user_id is required' })
    .custom(ValidUserId)
    .withMessage({ id: 'invalid-user_id', message: 'user_id not exists' }),
  check('amount')
    .exists()
    .withMessage({ id: 'required-amount', message: 'amount is required' })
    .bail()
    .isInt()
    .withMessage({ id: 'invalid-amount', message: 'Format is not accepted' }),
  check('type')
    .exists()
    .withMessage({ id: 'required-type', message: 'Type is required' })
    .bail()
    .isIn(Object.values(TransactionType))
    .withMessage({ id: 'invalid-type', message: 'Type is invalid' }),
];
export const validateUserId = (): ValidationChain[] => [
  query('user_id')
    .optional()
    .bail()
    .custom(ValidUserId)
    .withMessage({ id: 'invalid-user_id', message: 'user_id not exists' }),
];

export const validateListTransactions = (): ValidationChain[] => [
  query('type')
    .optional()
    .bail()
    .isIn(Object.values(TransactionType))
    .withMessage({ id: 'invalid-type', message: 'Type is invalid' }),
  ...validateUserId(),
];
