import { MongoClient } from "mongodb";
import { URI } from "./consts";

export const getUsers = async (req: any, res: any) => {
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    const cursor = collection.find({});
    const usersTotal = await cursor.toArray();
    const users = usersTotal.map(({ password, _id, ...rest }) => rest);

    res.status(200).json(users);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
