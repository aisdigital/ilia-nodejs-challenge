import { MongoClient } from "mongodb";
import { URI } from "./consts";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

export const getToken = async (req: any, res: any) => {
  const user = req.body.user;
  if (user === undefined)
    return res.status(422).json({ message: "Missing user info" });
  if (user.email === undefined)
    return res.status(422).json({ message: "Missing email" });
  if (user.password === undefined)
    return res.status(422).json({ message: "Missing password" });

  const client = new MongoClient(URI);

  try {
    await client.connect();

    const database = client.db("users");
    const collection = database.collection("info");

    const cursor = collection.find({ email: user.email });
    const users = await cursor.toArray();
    if (users.length === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      const userDB = users.map(({ _id, ...rest }) => rest)[0];
      const isPass = await bcrypt.compare(user.password, userDB.password);
      if (isPass) {
        delete userDB["password"];
        const token = jwt.sign(user, process.env.JWT_KEY);

        res.status(200).json({ user: userDB, access_token: token });
      } else {
        res.status(401).json({ message: "Authentication failed" });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Problem connecting to database" });
  } finally {
    await client.close();
  }
};
