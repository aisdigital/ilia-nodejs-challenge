import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { TransactionsModel } from "./types";

export const postTransactions = async (req, res) => {
  const info = req.body;
  console.log(info);
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
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
