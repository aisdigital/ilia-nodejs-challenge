import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const checkErrorSchema = (body, fieldErrors: string[]): void => {
  expect(['message', 'field_errors']).toEqual(
    expect.arrayContaining(Object.keys(JSON.parse(body))),
  );
  expect(Object.keys(JSON.parse(body).field_errors).sort()).toEqual(fieldErrors.sort());
};
export const checkErrorIdSchema = (body, fieldErrors: string, id: string): void => {
  expect(['message', 'field_errors']).toEqual(
    expect.arrayContaining(Object.keys(JSON.parse(body))),
  );
  expect(
    JSON.parse(body).field_errors[fieldErrors].find((errors) => errors.id === id),
  ).not.toBeUndefined();
};

export const accessToken = (_id: string) => {
  const JWT_SECRET = 'testJwtSecret';
  const JWT_EXPIRATION = 4 * 60 * 60;

  return `Bearer ${jwt.sign(
    {
      _id: _id,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
    },
  )}`;
};

export const mongoServerInit = () => {
  let mongoServer;

  beforeAll(async (done) => {
    mongoServer = new MongoMemoryServer();

    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri);
    done();
  });

  afterAll(async (done) => {
    await mongoServer.stop();
    mongoose.connection.close();
    done();
  });
};
export const getRandomEmail = async () => {
  const random = Math.round(Math.random() * (99999 - 111) + 111);
  return `test${random}@test.com`;
};
export const createFakeUser = async () => {
  const email = await getRandomEmail();
  return await mongoose.model('User').create({
    first_name: 'First',
    last_name: 'Last',
    email: email,
    password: 'Ab@12312',
  });
};
