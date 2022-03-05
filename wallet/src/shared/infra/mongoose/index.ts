import mongoose from 'mongoose';
import 'dotenv/config'

const databaseUri = process.env.DATABASE_URI || ''

mongoose.connect(databaseUri);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
