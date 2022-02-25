import { UsersResponse } from "./types";
import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { isUserInfo } from "./utils";

export const updateUser = async (req: any, res: any) => {
  const userId = req.params.id;
  const info = req.body;
  if (!isUserInfo(info))
    return res.status(422).json({ message: "Wrong body format" });
  console.log(userId);

  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    const cursor = collection.find({ email: info.email });
    const users = await cursor.toArray();
    if (users.length > 0 && users[0]["id"] !== userId) {
      res.status(409).json({ message: "Email already taken" });
      await client.close();
      return;
    }

    const result = await collection.updateOne({ id: userId }, { $set: info });

    const response: UsersResponse = {
      id: info.id,
      first_name: info.first_name,
      last_name: info.last_name,
      email: info.email,
    };

    if (result.matchedCount === 1) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
