import { check, ValidationChain } from 'express-validator';

export const validateLogin = (): ValidationChain[] => [
  check('email')
    .exists()
    .withMessage({ id: 'required-email', message: 'Email is required' })
    .isEmail()
    .withMessage({ id: 'invalid-email', message: 'Format is not accepted' }),
  check('password')
    .exists()
    .withMessage({ id: 'required-password', message: 'Password is required' }),
];

export const validateRefresh = (): ValidationChain[] => [
  check('refresh_token')
    .exists()
    .withMessage({ id: 'required-refresh-token', message: 'Refresh Token is required' })
    .bail()
    .notEmpty()
    .withMessage({ id: 'invalid-refresh-token', message: 'Refresh Token is invalid' }),
];
