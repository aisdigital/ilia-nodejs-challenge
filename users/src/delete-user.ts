import { MongoClient } from "mongodb";
import { URI } from "./consts";

export const deleteUser = async (req: any, res: any) => {
  const userId = req.params.id;
  console.log(userId);

  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    const result = await collection.deleteOne({ id: userId });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "successfully deleted user" });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
