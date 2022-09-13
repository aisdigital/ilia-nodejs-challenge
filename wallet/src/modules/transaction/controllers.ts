import { Request, Response } from 'express'
import { Token } from '../../utils/passport'
import { TransactionModel } from './models/transaction'

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

      const transactions = await TransactionModel
        .find(findOptions)
        .populate({ path: 'receiving_user_id', select: '_id email name' })
        .populate({ path: 'paying_user_id', select: '_id email name' })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(Number(limit))

      const totalCount = await TransactionModel.countDocuments(findOptions)

      return res.status(200).json({
        results: transactions,
        page: Number(page),
        limit: Number(limit),
        totalCount,
      }).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const { price, type, receiving_user_id } = req.body
      const paying_user_id = (req.user as Token)?._id

      const transaction = await TransactionModel.create({
        price,
        type,
        receiving_user_id,
        paying_user_id
      })
  
      return res.status(201).json(transaction).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  }
}