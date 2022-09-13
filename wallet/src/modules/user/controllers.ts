import { Request, Response } from 'express'
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
      })
    } catch (err) {
      return res.status(400).send(err)
    }
  },
  create: async (req: Request, res:Response) => {
    try {
      const { email, name } = req.body

      const user = await UserModel.create({
        email,
        name,
      })

      return res.status(201).json(user)
    } catch (err) {
      return res.status(400).send(err)
    }
  }
}