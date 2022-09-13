import { Request, Response } from 'express'
import { getAccessToken } from '../../utils/getAccessToken'
import { UserModel } from './models/user'

export const userController = {
  list: async (req: Request, res: Response) => {
    try {
      const page = req.query.page ?? 0
      const limit = req.query.limit ?? 20
      const offset = Number(limit) * Number(page)

      const users = await UserModel.find().skip(offset).limit(Number(limit))
      const totalCount = await UserModel.countDocuments()

      return res.status(200).json({
        results: users,
        page: Number(page),
        limit: Number(limit),
        totalCount,
      }).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  },
  get: async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const user = await UserModel.findOne({ _id: id })
      const token = getAccessToken(user?._id, false)

      return res.status(200).json({ user: user?.serialize(), token }).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  },
  create: async (req: Request, res:Response) => {
    try {
      const { email, name } = req.body

      const user = await UserModel.create({
        email,
        name,
      })
      const token = getAccessToken(user?._id, false)

      return res.status(201).json({ user: user?.serialize(), token }).end()
    } catch (err) {
      return res.status(400).send((err as any).message)
    }
  }
}