/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest';
import app from '../src/server';
import mongoose from 'mongoose';
import assert from 'assert';

import {
  mongoServerInit,
  accessToken,
  createFakeUser,
  checkErrorSchema,
  createFakeTransaction,
} from './utils';

describe('POST /transactions', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });

  it('Should not create a transaction without required parameters', (done) => {
    return supertest(app)
      .post('/transactions')
      .set('Authorization', accessToken(user._id))
      .set('Accept', 'application/json')
      .send({})
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['user_id', 'amount', 'type']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should not create a user with a wrong parameters', (done) => {
    return supertest(app)
      .post('/transactions')
      .set('Authorization', accessToken(user._id))
      .set('Accept', 'application/json')
      .send({
        user_id: '',
        amount: '',
        type: 'invoice',
      })
      .expect(422)
      .then((response) => {
        checkErrorSchema(response.text, ['user_id', 'amount', 'type']);
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });

  it('Should create a new transaction', async (done) => {
    const data = {
      user_id: user._id,
      amount: Math.round(Math.random() * (1000 - 1) + 1),
      type: 'CREDIT',
    };
    return supertest(app)
      .post('/transactions')
      .set('Authorization', accessToken(user._id))
      .set('Accept', 'application/json')
      .send(data)
      .expect(201)
      .then(async (response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            _id: expect.any(String),
            user_id: expect.any(String),
            amount: expect.any(Number),
            type: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /transactions', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });
  it('Should list transactions', async (done) => {
    await createFakeTransaction(user._id, 'CREDIT');
    await createFakeTransaction(user._id, 'DEBIT');
    return supertest(app)
      .get('/transactions')
      .set('Authorization', accessToken(user._id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body).toEqual(expect.not.arrayContaining(['']));
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not list transactions without JWT', (done) => {
    return supertest(app)
      .get('/transactions')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('GET /balance', () => {
  mongoServerInit();
  let user;
  beforeEach(async () => {
    user = await createFakeUser();
  });
  it('Should show balance', async (done) => {
    const transactionsDebit = await Promise.all(
      [...Array(5)].map(async () => await createFakeTransaction(user._id, 'DEBIT')),
    );
    const trasactionsCredit = await Promise.all(
      [...Array(5)].map(async () => await createFakeTransaction(user._id, 'CREDIT')),
    );
    const totalDebit = transactionsDebit.reduce((prev, current) => prev + current.amount, 0);
    const totalCredit = trasactionsCredit.reduce((prev, current) => prev + current.amount, 0);

    return supertest(app)
      .get('/balance')
      .set('Authorization', accessToken(user._id))
      .expect(200)
      .then((response) => {
        expect(response.header.connection).toEqual('close');
        expect(response.body.credit).toEqual({ amount: totalCredit });
        expect(response.body.debit).toEqual({ amount: totalDebit });
        expect(response.body.all).toEqual({ amount: totalCredit + totalDebit });
        done();
      })
      .catch((err) => done(err));
  });
  it('Should not show balance without JWT', (done) => {
    return supertest(app)
      .get('/balance')
      .expect(401)
      .then((response) => {
        expect(response.text).toEqual('Unauthorized');
        expect(response.header.connection).toEqual('close');
        done();
      })
      .catch((err) => done(err));
  });
});
