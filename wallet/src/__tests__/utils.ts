import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import uuid4 from 'uuid4'
import { faker } from '@faker-js/faker'
import { UserModel } from '../modules/user/models/user'
import { TransactionModel } from '../modules/transaction/models/transaction'
import { TransactionType } from '../modules/transaction/types'

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
    name: faker.name.fullName()
  })
}

export const createFakeTransaction = async () => {
  const payingUser = await createFakeUser()
  const receivingUser = await createFakeUser()

  return TransactionModel.create({
    price: faker.commerce.price(),
    type: TransactionType.CREDIT,
    receiving_user_id: receivingUser._id,
    paying_user_id: payingUser._id,
  })
}