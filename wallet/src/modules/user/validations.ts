import { check, param, ValidationChain } from 'express-validator'
import { UserModel } from './models/user'

export const validateCreateUser = (): ValidationChain[] => [
  check('email')
    .exists()
    .withMessage('Email is required')
    .custom(async email => {
      const exists = await UserModel.exists({ email })

      if(exists) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Email already in use'),
  check('name')
    .exists()
    .withMessage('Name is required'),
  check('password')
    .exists()
    .withMessage('Password is required')
]

export const validateGetUser = (): ValidationChain[] => [
  param('id')
    .exists()
    .withMessage('User id is required')
    .isString()
    .withMessage('User id must be string')
]