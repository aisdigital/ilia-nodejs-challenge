import mongoose from 'mongoose'
import request from 'supertest'
import { Transaction, TransactionType } from '../../modules/transaction/types'
import { User } from '../../modules/user/types'
import { app } from '../../server'
import { getAccessToken } from '../../utils/getAccessToken'
import { clearDatabase, createFakeTransaction, createFakeUser, mongoServerInit } from '../utils'

describe('Transaction test suite', () => {
  let payingUser: User
  let receivingUser: User
  
  mongoServerInit()

  beforeAll(async () => {
    payingUser = await createFakeUser()
    receivingUser = await createFakeUser()
  })

  describe('POST /transactions', () => {
    it('should return unauthorized when no token is sent', async () => {
      const result = await request(app)
        .post('/transactions')
        .send({
          price: 250.99,
          type: TransactionType.CREDIT,
          receiving_user_id: receivingUser?._id
        })
      
      expect(result.statusCode).toEqual(401)
    })

    it('should create a transaction', async () => {
      const result = await request(app)
      .post('/transactions')
      .set('Authorization', getAccessToken(payingUser?._id))
      .send({
        price: 250.99,
        type: TransactionType.CREDIT,
        receiving_user_id: receivingUser?._id
      })
    
      expect(result.statusCode).toEqual(201)
      expect(result.body).toMatchObject({
        price: 250.99,
        type: TransactionType.CREDIT,
        paying_user_id: payingUser._id,
        receiving_user_id: receivingUser._id,
      })
    })

    it('should not create a transaction when no receiving_user_id is sent', async () => {
      const result = await request(app)
      .post('/transactions')
      .set('Authorization', getAccessToken(payingUser?._id))
      .send({
        price: 250.99,
        type: TransactionType.CREDIT,
      })

      expect(result.statusCode).toEqual(500)
    })

    it('should not create a transaction when no price is sent', async () => {
      const result = await request(app)
      .post('/transactions')
      .set('Authorization', getAccessToken(payingUser?._id))
      .send({
        type: TransactionType.CREDIT,
        receiving_user_id: receivingUser._id,
      })

      expect(result.statusCode).toEqual(500)
    })

    it('should not create a transaction when no type is sent', async () => {
      const result = await request(app)
      .post('/transactions')
      .set('Authorization', getAccessToken(payingUser?._id))
      .send({
        price: 250.99,
        receiving_user_id: receivingUser._id,
      })

      expect(result.statusCode).toEqual(500)
    })
  })

  describe('GET /transactions', () => {
    let transactions: Transaction[] = []

    beforeAll(async () => {
      clearDatabase()
      transactions.push(await createFakeTransaction())
      transactions.push(await createFakeTransaction())
    })

    it('should return unauthorized when no token is sent', async () => {
      const result = await request(app)
        .get('/transactions')
        .send()
      
      expect(result.statusCode).toEqual(401)
    })

    it('should return a list of transactions', async () => {
      const result = await request(app)
      .get('/transactions')
      .set('Authorization', getAccessToken())
      .send()
    
      expect(result.statusCode).toEqual(200)
      expect(result.body)
        .toMatchObject({ results: transactions
          .sort((a, b) => (a as any).createdAt > (b as any).createdAt ? -1 : 1)
          .map(transaction => ({ 
            price: transaction.price,
            type: transaction.type,
            paying_user_id: transaction.paying_user_id,
            receiving_user_id: transaction.receiving_user_id,
        }))
      })
    })
  })

  describe('GET /transactions/:id', () => {
    let transaction: Transaction
    let wrongTransaction: Transaction

    beforeAll(async () => {
      clearDatabase()
      transaction = await createFakeTransaction()
      wrongTransaction = await createFakeTransaction()
    })

    it('should return unauthorized when no token is sent', async () => {
      const result = await request(app)
        .get(`/transactions/${transaction._id}`)
        .send()
      
      expect(result.statusCode).toEqual(401)
    })

    it('should return the data of the transaction whose id is sent', async () => {
      const result = await request(app)
      .get(`/transactions/${transaction._id}`)
      .set('Authorization', getAccessToken())
      .send()
    
      expect(result.statusCode).toEqual(200)
      expect(result.body).toMatchObject({
        _id: transaction._id,
        price: transaction.price,
        type: transaction.type,
      })
      expect(result.body).not.toMatchObject({
        _id: wrongTransaction._id,
        price: wrongTransaction.price,
        type: wrongTransaction.type,
      })
    })
  })
})