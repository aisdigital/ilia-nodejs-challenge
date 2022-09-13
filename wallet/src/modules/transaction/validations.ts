import { check, query, ValidationChain } from 'express-validator'
import { UserModel } from '../user/models/user'
import { TransactionType } from './types'

export const validateListTransactions = (): ValidationChain[] => [
  query('receiving_user_id')
    .optional()
    .custom(async _id => {
      const exists = await UserModel.exists({ _id })

      if(!exists) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Receiving user does not exist'),
  query('paying_user_id')
    .optional()
    .custom(async _id => {
      const exists = await UserModel.exists({ _id })

      if(!exists) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Paying user does not exist'),
]

export const validateCreateTransaction = (): ValidationChain[] => [
  check('receiving_user_id')
    .exists()
    .withMessage('Receiving user id is required')
    .custom(async _id => {
      const exists = await UserModel.exists({ _id })

      if(!exists) return Promise.reject()
      return Promise.resolve()
    })
    .withMessage('Receiving user does not exist'),
  check('price')
    .exists()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
  check('type')
    .exists()
    .withMessage('Type is required')
    .custom(type => {
      if([TransactionType.DEBIT, TransactionType.CREDIT].includes(type)) {
        return Promise.resolve()
      }

      return Promise.reject()
    })
    .withMessage('Type must be debit or credit')
]