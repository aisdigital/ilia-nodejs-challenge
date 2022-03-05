// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import 'dotenv/config';

const databaseUri = process.env.DATABASE_URI || '';
if (process.env.NODE_ENV === 'dev') {
  mongoose.connect(databaseUri);
  const db = mongoose.connection;

  // eslint-disable-next-line no-console
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
} else {
  MongoMemoryServer.create().then(mongoServer =>
    mongoose.connect(mongoServer.getUri(), { dbName: 'testeiliamongodb' }),
  );
}
