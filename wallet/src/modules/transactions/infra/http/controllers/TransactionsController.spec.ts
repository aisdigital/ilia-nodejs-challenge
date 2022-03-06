import TransactionsRepository from '@modules/transactions/infra/mongoose/repositories/TransactionsRepository';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import app from '@shared/infra/http/app';
import TransactionEntity, {
  TransactionType,
} from '../../mongoose/entities/TransactionEntity';

let transactionsRepository: TransactionsRepository;

describe('TransactionsController', () => {
  beforeAll(() => {
    transactionsRepository = new TransactionsRepository();
  });

  beforeEach(async () => {
    await TransactionEntity.deleteMany({}).exec();
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

    it('should be able to throw error 500 if unable to record transaction', async () => {
      jest
        .spyOn(TransactionsRepository.prototype, 'create')
        .mockImplementationOnce(() => Promise.reject(Error('Teste error')));

      const input = {
        user_id: 'qwe',
        amount: 12,
        type: 'CREDIT',
      };
      const response = await request(app).post('/transactions').send(input);

      expect(response.status).toBe(500);
      expect(response?.body?.message).toBe('Erro ao registrar transação.');
    });
  });

  describe('Find Transactions', () => {
    it('should be able to list the transactions', async () => {
      const transactionToCreate = {
        user_id: 'laco',
        amount: 112,
        type: TransactionType.CREDIT,
      };
      await transactionsRepository.create(transactionToCreate);

      const response = await request(app).get('/transactions').send();
      expect(response.status).toBe(200);

      expect(response.body[0]).toEqual(
        expect.objectContaining(transactionToCreate),
      );
    });
  });
});
