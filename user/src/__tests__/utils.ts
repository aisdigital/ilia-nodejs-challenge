import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
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

export const createFakeUser = async () => {
  return UserModel.create({
    email: faker.internet.email(),
    name: faker.name.fullName(),
    password: faker.random.words(),
  })
}