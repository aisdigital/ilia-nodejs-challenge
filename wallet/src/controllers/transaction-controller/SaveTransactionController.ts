import { Request, Response } from "express";
import { TransactionRepository } from "@repositories/transaction-repository/TransactionRepository";
import { SaveTransactionService } from "@service/transaction-service/SaveTransactionService";

type TransactionRequestProps = {
  amount: number;
  type: "CREDIT" | "DEBIT";
};

export class SaveTransactionController {
  async handle(request: Request, response: Response) {
    const { amount, type } = request.body as TransactionRequestProps;

    const transactionRepository = new TransactionRepository();
    const transactionService = new SaveTransactionService(transactionRepository);

    try {
      if (type === "CREDIT" || type === "DEBIT") {
        const transactionResponse = await transactionService.execute(amount, type);
        return response.status(201).json(transactionResponse);
      } else {
        return response.status(400).json("Invalid transaction type");
      }
    } catch (err) {
      if (!request.body) {
        return response.status(400).json("Invalid Parameters.");
      }
      return response.status(500).json(`Internal Error - ${err}`);
    }
  }
}
