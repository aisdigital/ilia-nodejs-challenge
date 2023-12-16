import { Request, Response } from 'express'

import { Controller } from '../../infra/api/protocols'

export const adaptRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpRequest = {
      ...(req.body || {}),
      ...(req.params || {}),
      ...(req.query || {})
    }

    const httpResponse = await controller.handle(httpRequest)

    if (httpResponse?.statusCode >= 200 && httpResponse?.statusCode <= 299) {
      return res
        .status(httpResponse?.statusCode)
        .json(httpResponse?.body)
    } else {
      return res
        .status(httpResponse?.statusCode)
        .json({
          error: httpResponse?.body?.message
        })
    }
  }
}