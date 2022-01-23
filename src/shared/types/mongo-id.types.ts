import { ObjectId } from "mongodb";

export type MongoId<T> = T & { _id: ObjectId | string };
