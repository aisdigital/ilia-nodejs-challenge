import { ObjectId } from "mongodb";
import { transactionCollection } from "../../config/mongo-db-connection.config";
import { ITransactionDTO } from "./../../shared/interfaces/dto/transaction.dto";

export class Repository {
  public async insertOne(data: ITransactionDTO) {
    const response = await transactionCollection.insertOne(data);

    return response;
  }

  public async findOne(transactionId: string) {
    const response = await transactionCollection
      .findOne({ _id: new ObjectId(transactionId) })
      .catch((err) => {
        console.error(err);
      });

    return response;
  }

  public async findAll() {
    const response = await transactionCollection
      .find()
      .toArray()
      .catch((err) => console.error(err));

    return response;
  }

  public async findAllByTransactionTypeAndUserId(
    transactionType: string,
    userId: string
  ) {
    const filter = {
      type: transactionType,
      user_id: userId,
    };
    const response = await transactionCollection
      .find(filter)
      .toArray()
      .catch((err) => console.error(err));

    return response;
  }
}
