import { UserInfo, UsersResponse } from "./types";
import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { isUserInfo } from "./utils";

export const addUser = async (req: any, res: any) => {
  const info = req.body;
  if (!isUserInfo(info))
    return res.status(422).json({ message: "wrong body format" });
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    let cursor = collection.find({ id: info.id });
    let users = await cursor.toArray();
    if (users.length > 0) {
      res.status(409).json({ message: "user id already exists" });
    }
    cursor = collection.find({ email: info.email });
    users = await cursor.toArray();
    if (users.length > 0) {
      res.status(409).json({ message: "user email already exists" });
    }

    const result = await collection.insertOne(info);
    const response: UsersResponse = {
      id: info.id,
      first_name: info.first_name,
      last_name: info.last_name,
      email: info.email,
    };
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "problem connecting to database" });
  } finally {
    await client.close();
  }
};
