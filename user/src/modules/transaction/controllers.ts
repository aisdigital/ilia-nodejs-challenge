import { Request, Response } from 'express'
import { Token } from '../../utils/passport'
import { transactionClient } from './client'

export const transactionController = {
  list: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ?? 0
      const limit = req.query.limit ?? 20
      const offset = Number(limit) * Number(page)

      transactionClient.List(
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
  get: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      transactionClient.Get(
        {
          _id: id,
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
  create: async (req: Request, res: Response) => {
    try {
      const { price, type, receiving_user_id } = req.body
      const paying_user_id = (req.user as Token)?._id

      transactionClient.Create(
        {
          price,
          type,
          receiving_user_id,
          paying_user_id,
        },
        (error: any, response: any) => {
          if (error) return res.status(400).json(error)
          return res.status(200).json(response)
        }
      )
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  }
}