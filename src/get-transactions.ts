import { MongoClient } from "mongodb";
import { URI } from "./consts";

export const getTransactions = async (req, res) => {
  const tp: string = req.query.type;
  if (tp === undefined)
    return res.status(422).json({ message: "missing 'type' parameter" });
  if (tp !== "CREDIT" && tp !== "DEBIT")
    return res.status(422).json({ message: "wrong type of transaction" });
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("wallet");
    const collection = database.collection("transactions");

    const cursor = collection.find({ type: tp });
    const transactions = await cursor.toArray();

    res.status(200).json(transactions);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
