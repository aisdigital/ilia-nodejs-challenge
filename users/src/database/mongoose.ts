// require mongoose module
import mongoose from 'mongoose';
import chalk from 'chalk';

const { DB_PORT, DB_USERNAME, DB_PASSWORD, DB_URI } = process.env;
const DB_URL =
  DB_URI ?? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@userDb:${DB_PORT}/users?authSource=admin`;

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

export default connect;
