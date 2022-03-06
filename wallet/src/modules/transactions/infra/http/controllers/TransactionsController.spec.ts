import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import app from '@shared/infra/http/app';
import { TransactionType } from '../../mongoose/entities/TransactionEntity';

let fakeTransactionsRepository: FakeTransactionsRepository;

describe('TransactionsController', () => {
  beforeEach(() => {
    fakeTransactionsRepository = new FakeTransactionsRepository();
  });

  describe('Create Transactions', () => {
    it('should be able to create the transaction', async () => {
      const response = await request(app).post('/transactions').send({
        user_id: 'laco',
        amount: 112,
        type: 'CREDIT',
      });
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
    });

    it("should be able to throw error 400 if not receiving 'user_id' or not having correct type", async () => {
      await request(app)
        .post('/transactions')
        .send({})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'user_id é um campo obrigatório do tipo string.',
          );
        });

      await request(app)
        .post('/transactions')
        .send({ user_id: 1 })
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'user_id é um campo obrigatório do tipo string.',
          );
        });
    });

    it("should be able to throw error 400 if not receiving 'amount' or not having correct type", async () => {
      await request(app)
        .post('/transactions')
        .send({
          user_id: 'qwe',
        })
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'amount é um campo obrigatório do tipo number.',
          );
        });

      await request(app)
        .post('/transactions')
        .send({ user_id: 'qwe', amount: 'qwe' })
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'amount é um campo obrigatório do tipo number.',
          );
        });
    });

    it("should be able to throw error 400 if not receiving 'type' or not having correct type", async () => {
      await request(app)
        .post('/transactions')
        .send({
          user_id: 'qwe',
          amount: 12,
        })
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'type é um campo obrigatório do tipo string sendo CREDIT ou DEBIT.',
          );
        });

      await request(app)
        .post('/transactions')
        .send({ user_id: 'qwe', amount: 12, type: 'type_error' })
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'type é um campo obrigatório do tipo string sendo CREDIT ou DEBIT.',
          );
        });
    });
  });

  describe('Find Transactions', () => {
    it('should be able to list the transactions', async () => {
      const transactionToCreate = {
        user_id: 'laco',
        amount: 112,
        type: TransactionType.CREDIT,
      };
      await fakeTransactionsRepository.create(transactionToCreate);

      const response = await request(app).get('/transactions').send();
      expect(response.status).toBe(200);

      expect(response.body[0]).toEqual(
        expect.objectContaining(transactionToCreate),
      );
    });
  });
});
