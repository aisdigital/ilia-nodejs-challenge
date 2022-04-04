// require mongoose module
import mongoose, { Schema, Document } from 'mongoose';
import chalk from 'chalk';
import { MongoMemoryServer } from 'mongodb-memory-server';

const { DB_USERNAME, DB_PASSWORD, DB_URI, DB_USER_URI } = process.env;
const DB_URL =
  DB_URI ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@walletDb:27017/wallet?authSource=admin`;
const DB_USER_URL =
  DB_USER_URI ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@userDb:27017/users?authSource=admin`;

export const connected = chalk.bold.cyan;
export const error = chalk.bold.red;
export const disconnected = chalk.bold.yellow;
export const termination = chalk.bold.magenta;

const connect = (): void => {
  mongoose.connect(DB_URL);

  mongoose.connection.on('connected', function (): void {
    console.log(connected('Mongoose default connection is open to', DB_URL));
  });
  mongoose.connection.on('error', function (err): void {
    console.log(error(`Mongoose default connection has occured ${err} error`));
  });
  mongoose.connection.on('disconnected', function (): void {
    console.log(disconnected('Mongoose default connection is disconnected'));
  });
  process.on('SIGINT', function (): void {
    mongoose.connection.close(function () {
      console.log(
        termination('Mongoose default connection is disconnected due to application termination'),
      );
      process.exit(0);
    });
  });
};

let mongoServer1;
const connections = {
  conn1: mongoose.createConnection(),
};

if (process.env.NODE_ENV === 'test') {
  mongoServer1 = new MongoMemoryServer();

  mongoServer1.getUri('USER_DB').then((mongoUri) => {
    connections.conn1.openUri(mongoUri);
    mongoose.connection.once('open', () => {
      return true;
    });
  });
}
const userDb =
  process.env.NODE_ENV !== 'test' ? mongoose.createConnection(DB_USER_URL) : connections.conn1;

interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = userDb.model<IUser>(
  'User',
  new Schema(
    {
      email: { type: String, required: true, unique: true },
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      password: { type: String, required: true },
    },
    {
      timestamps: true,
    },
  ),
);

export default connect;
