import { UsersResponse } from "./types";
import { MongoClient } from "mongodb";
import { URI } from "./consts";
import { isUserInfo } from "./utils";
const bcrypt = require("bcrypt");

export const addUser = async (req: any, res: any) => {
  const info = req.body;
  if (!isUserInfo(info))
    return res.status(422).json({ message: "Wrong body format" });
  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    let cursor = collection.find({ id: info.id });
    let users = await cursor.toArray();
    if (users.length > 0) {
      res.status(409).json({ message: "Id already taken" });
      await client.close();
      return;
    }
    cursor = collection.find({ email: info.email });
    users = await cursor.toArray();
    if (users.length > 0) {
      res.status(409).json({ message: "Email already taken" });
      await client.close();
      return;
    }

    info.password = await bcrypt.hash(info.password, 10);

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
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
