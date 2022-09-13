import { Request, Response } from 'express'
import { Token } from '../../utils/passport'
import { TransactionModel } from './models/transaction'

export const transactionController = {
  create: async (req: Request, res: Response) => {
    try {
      const { price, type, receiving_user_id } = req.body
      const paying_user_id = (req.user as Token)?._id

      const transaction = await TransactionModel.populate(
        {
          price,
          type,
          receiving_user_id,
          paying_user_id
        }, 
        [
          {
            path: 'receiving_user_id',
            select: ['_id', 'email', 'name']
          },
          {
            path: 'paying_user_id',
            select: ['_id', 'email', 'name']
          },
        ]
      )
  
      return res.status(201).json(transaction).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  }
}