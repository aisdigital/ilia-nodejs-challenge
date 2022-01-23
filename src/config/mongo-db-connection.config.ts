import { Collection, MongoClient } from "mongodb";
import { MongoId } from "../shared/types/mongo-id.types";

let mongoClient: MongoClient;
let transactionCollection: Collection<MongoId<any>>;

async function initMongoDBConnection() {
  mongoClient = new MongoClient(process.env.MONGO_DB_URL_CONNECTION);
  await mongoClient.connect();

  const database = mongoClient.db(process.env.MONGO_DB_NAME);
  transactionCollection = database.collection(process.env.MONGO_DB_COLLECTION);
}

export { initMongoDBConnection, mongoClient, transactionCollection };
