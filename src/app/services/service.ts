import { TransactionType } from "../../shared/enums/transaction-type.enums";
import { BadRequestError } from "../../shared/helpers/response/error.response";
import { ITransactionDTO } from "../../shared/interfaces/dto/transaction.dto";
import { Repository } from "../repositories/repository";

const repository = new Repository();

export class Service {
  public async insertOne(data: ITransactionDTO) {
    if (
      !TransactionType.CREDIT.includes(data.type) &&
      !TransactionType.DEBIT.includes(data.type)
    ) {
      throw new BadRequestError("O tipo da transição está incorreta!");
    }

    const transaction = await repository.insertOne(data).catch((err) => {
      console.error(err);
      throw new BadRequestError(err);
    });
    const response = await repository.findOne(
      transaction.insertedId.toString()
    );

    return response;
  }

  public async findAllByTransactionTypeAndUserId(
    transactionType: string,
    userId: string
  ) {
    transactionType = transactionType.toUpperCase();
    if (
      !TransactionType.CREDIT.includes(transactionType) &&
      !TransactionType.DEBIT.includes(transactionType)
    ) {
      throw new BadRequestError("O tipo da transição está incorreta!");
    }

    const response = await repository.findAllByTransactionTypeAndUserId(
      transactionType,
      userId
    );

    return response;
  }
}
