import { Request, Response } from 'express'
import { Token } from '../../utils/passport'
import { transactionClientTransaction } from './client'

export const transactionController = {
  list: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ?? 0
      const limit = req.query.limit ?? 20
      const offset = Number(limit) * Number(page)

      let findOptions = {}

      if(req.query.receiving_user_id) {
        findOptions = Object.assign(findOptions, { receiving_user_id: req.query.receiving_user_id })
      }

      if(req.query.paying_user_id) {
        findOptions = Object.assign(findOptions, { paying_user_id: req.query.paying_user_id })
      }

      transactionClientTransaction.createTransaction(
        {
          page,
          limit,
          offset,
          receiving_user_id: req.query.receiving_user_id,
          paying_user_id: req.query.paying_user_id,
        },
        (error: any, response: any) => {
          if (error) return res.status(400).json(error)
          return res.status(200).json(response)
        }
      )
     
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  },
}