import { MongoClient } from "mongodb";
import { URI } from "./consts";

export const getTransactionsId = async (req: any, res: any) => {
  const userId = req.params.id;
  const tp: string = req.query.type;
  if (tp === undefined)
    return res.status(422).json({ message: "Missing 'type' parameter" });
  if (tp !== "CREDIT" && tp !== "DEBIT")
    return res.status(422).json({ message: "Wrong type of transaction" });
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("wallet");
    const collection = database.collection("transactions");

    const cursor = collection.find({ type: tp, user_id: userId });
    const temp = await cursor.toArray();
    const transactions = temp.map(({ _id, ...rest }) =>
      Object.assign({}, { id: _id }, rest)
    );

    res.status(200).json(transactions);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
