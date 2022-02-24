import { MongoClient } from "mongodb";

const connectDB = (host: string, port: string | number) => {
  const uri = "mongodb://" + host + ":" + port;

  const client = new MongoClient(uri);
};
