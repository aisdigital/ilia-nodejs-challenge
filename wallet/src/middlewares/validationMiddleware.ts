import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req).array()

    if(errors?.length !== 0) {
      return next(
        new Error(
          errors.map(err => err.msg).join("\n")
        )
      )
    }

    return next()
  } catch (error) {
     return next(new Error((error as any).message))
  }
}