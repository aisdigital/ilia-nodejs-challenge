// require mongoose module
import mongoose, { Schema, Document } from 'mongoose';
import chalk from 'chalk';

const { DB_PORT, DB_USER_PORT, DB_USERNAME, DB_PASSWORD, DB_URI, DB_USER_URI } = process.env;
const DB_URL =
  DB_URI ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@walletDb:${DB_PORT}/wallet?authSource=admin`;
const DB_USER_URL =
  DB_USER_URI ??
  `mongodb://${DB_USERNAME}:${DB_PASSWORD}@walletDb:${DB_USER_PORT}/users?authSource=admin`;

export const connected = chalk.bold.cyan;
export const error = chalk.bold.red;
export const disconnected = chalk.bold.yellow;
export const termination = chalk.bold.magenta;

const connect = (): void => {
  console.log({ DB_PORT, DB_USERNAME, DB_PASSWORD, DB_URI });

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

const userDb = mongoose.createConnection(DB_USER_URL);

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
