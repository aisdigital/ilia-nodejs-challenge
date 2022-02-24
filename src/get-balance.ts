import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { getTokenFromReq } from "./utils";

export const getBalance = async (req, res) => {
  const token = getTokenFromReq(req);
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("wallet");
    const collection = database.collection("transactions");

    const cursor = collection.find({});
    const transactions = await cursor.toArray();

    const response = transactions.reduce((acc: number, curr) => {
      if (curr.type === "CREDIT") return acc + curr.amount;
      else return acc - curr.amount;
    }, 0);
    res.status(200).json({ amount: response });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
