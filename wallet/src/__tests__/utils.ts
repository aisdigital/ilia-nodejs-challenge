import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import uuid4 from 'uuid4'
import { faker } from '@faker-js/faker'
import { UserModel } from '../modules/user/models/user'

export const mongoServerInit = () => {
  let mongoServer: any

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = await mongoServer.getUri()

    await mongoose.connect(mongoUri)
  })

  afterAll(async () => {
    await mongoServer.stop()
    mongoose.connection.close()
  })
}

export const clearDatabase = async () => {
  return mongoose.connection.db.dropDatabase()
}

export const getAccessToken = (_id?: string) => {
  const { JWT_AUDIENCE, JWT_ISSUER } = process.env;
  const JWT_SECRET = String(process.env.JWT_SECRET);
  const JWT_EXPIRATION = 4 * 60 * 60;

  return `Bearer ${jwt.sign(
    {
      _id: _id ?? uuid4(),
    },
    JWT_SECRET ?? '',
    {
      audience: JWT_AUDIENCE,
      issuer: JWT_ISSUER,
      expiresIn: JWT_EXPIRATION,
    },
  )}`;
};

export const createFakeUser = async () => {
  return UserModel.create({
    email: faker.internet.email(),
    name: faker.name.fullName()
  })
}