import { MongoClient } from "mongodb";
import { URI } from "./consts";

export const getOneUser = async (req: any, res: any) => {
  const userId = req.params.id;
  console.log(userId);

  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    const cursor = collection.find({ id: userId });
    const users = await cursor.toArray();
    if (users.length === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      const user = users.map(({ password, _id, ...rest }) => rest)[0];

      res.status(200).json(user);
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
