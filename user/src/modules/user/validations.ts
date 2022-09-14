import { check, param, ValidationChain } from 'express-validator'
import { UserModel } from './models/user'
import bcrypt from 'bcryptjs';

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

export const validateLogin = (): ValidationChain[] => [
  check('password')
  .exists()
  .withMessage('Password is required'),
  check('email')
    .exists()
    .withMessage('Email is required')
    .custom(async email => {
      const exists = await UserModel.exists({ email })

      if(!exists) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Email not in use')
    .custom(async (email, { req }) => {
      const user = await UserModel.findOne({ email })
      const isPasswordCorrect = bcrypt.compareSync(req.body.password, user?.password as string)

      if(!isPasswordCorrect) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Wrong password'),
]