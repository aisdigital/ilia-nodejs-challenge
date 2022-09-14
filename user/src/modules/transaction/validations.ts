import { check, param, query, ValidationChain } from 'express-validator'
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