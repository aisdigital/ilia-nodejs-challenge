import { Request, Response } from "express";
import { StatusCode } from "../../shared/enums/status-code.enums";
import { ServiceError } from "../../shared/helpers/response/error.response";
import { Service } from "../services/service";

const service = new Service();

export class Controller {
  public async store(request: Request, response: Response) {
    try {
      // validar se user_id vem no corpo da requisição, caso não pegar no jwt token
      const transaction = await service.insertOne(request.body);

      return response.status(StatusCode.SUCCESS).json(transaction);
    } catch (err) {
      if (err instanceof ServiceError) {
        return response.status(err.statusCode).json({
          error: err.message,
        });
      }
    }

    return response
      .status(StatusCode.INTERNAL_ERROR)
      .json({ error: "Erro no servidor" });
  }

  public async findAllByTransactionTypeAndUserId(
    request: Request,
    response: Response
  ) {
    try {
      const transactionType = request.query.type as string;
      const userId = response?.locals["user"]?.id ?? "string"; // mudar implementação assim que adicionar o Auth middleware (body ou locals)
      const transactions = await service.findAllByTransactionTypeAndUserId(
        transactionType,
        userId
      );

      return response.status(StatusCode.SUCCESS).json(transactions);
    } catch (err) {
      if (err instanceof ServiceError) {
        return response.status(err.statusCode).json({
          error: err.message,
        });
      }

      return response
        .status(StatusCode.INTERNAL_ERROR)
        .json({ error: `Erro no servidor - Error ${err}` });
    }
  }
}
