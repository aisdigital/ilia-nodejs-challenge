import { TransactionType } from "../../shared/enums/transaction-type.enums";
import { BadRequestError } from "../../shared/helpers/response/error.response";
import { ITransactionDTO } from "../../shared/interfaces/dto/transaction.dto";
import { ITransaction } from "../../shared/interfaces/transaction.interface";
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

    data = {
      ...data,
      createdAt: new Date()
    }

    const transaction = await repository.insertOne(data).catch((err) => {
      console.error(err);
      throw new BadRequestError(err);
    });
    const response = await repository.findOne(
      transaction.insertedId.toString()
    );
    delete response.createdAt

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

  public async findBalance(userId: string) {
    const transactions = await repository.findBalance(userId).catch((err) => {
      console.error(err);
      throw new BadRequestError(err);
    });
    const response = this.calculationAmountByTransactionType(transactions);

    return response;
  }

  private calculationAmountByTransactionType(transactions: ITransaction[]) {
    let amount = 0;
    transactions.forEach((transaction: ITransaction) => {
      if (TransactionType.CREDIT.includes(transaction.type)) {
        amount += transaction.amount;

        return;
      }

      if (TransactionType.DEBIT.includes(transaction.type)) {
        if (transaction.amount < 0) {
          amount += transaction.amount;

          return;
        }

        amount -= transaction.amount;
      }
    });

    return {
      amount,
    };
  }
}
