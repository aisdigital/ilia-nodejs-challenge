import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { TransactionsModel } from "./types";
import { isTransaction } from "./utils";

export const postTransactions = async (req: any, res: any) => {
  console.log("entrou aqui");
  const info = req.body;
  if (!isTransaction(info))
    return res.status(422).json({ message: "Wrong body format" });
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("wallet");
    const collection = database.collection("transactions");

    const result = await collection.insertOne({
      user_id: info.user_id,
      amount: info.amount,
      type: info.type,
    });
    const response: TransactionsModel = {
      id: result.insertedId.toString(),
      user_id: info.user_id,
      amount: info.amount,
      type: info.type,
    };
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
