import TransactionsRepository from '@modules/transactions/infra/mongoose/repositories/TransactionsRepository';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import app from '@shared/infra/http/app';
import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';
import TransactionEntity, {
  TransactionType,
} from '../../mongoose/entities/TransactionEntity';

let transactionsRepository: TransactionsRepository;
let token: string;

describe('TransactionsController', () => {
  beforeAll(() => {
    token = sign({}, authConfig.jwt.secret);
    transactionsRepository = new TransactionsRepository();
  });

  beforeEach(async () => {
    await TransactionEntity.deleteMany({}).exec();
  });

  describe('Create Transactions', () => {
    it('should be able to require authentication when trying to create transaction', async () => {
      const response = await request(app).post('/transactions').send();
      expect(response.status).toBe(401);
      expect(response?.body?.message).toBe(
        'Favor, é preciso estar logado para continuar',
      );
    });

    it('should be able to create the transaction', async () => {
      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `bearer ${token}`)
        .send({
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
        .set('Authorization', `bearer ${token}`)
        .send({})
        .then(response => {
          expect(response.status).toBe(400);
          expect(response?.body?.message).toBe(
            'user_id é um campo obrigatório do tipo string.',
          );
        });

      await request(app)
        .post('/transactions')
        .set('Authorization', `bearer ${token}`)
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
        .set('Authorization', `bearer ${token}`)
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
        .set('Authorization', `bearer ${token}`)
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
        .set('Authorization', `bearer ${token}`)
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
        .set('Authorization', `bearer ${token}`)
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
      const response = await request(app)
        .post('/transactions')
        .set('Authorization', `bearer ${token}`)
        .send(input);

      expect(response.status).toBe(500);
      expect(response?.body?.message).toBe('Erro ao registrar transação.');
    });
  });

  describe('Find Transactions', () => {
    it('should be able to require authentication when trying to list the transactions', async () => {
      const response = await request(app).get('/transactions').send();
      expect(response.status).toBe(401);
      expect(response?.body?.message).toBe(
        'Favor, é preciso estar logado para continuar',
      );
    });

    it('should be able to list the transactions', async () => {
      const transactionsToCreate = [
        {
          user_id: 'laco',
          amount: 112,
          type: TransactionType.CREDIT,
        },
        {
          user_id: 'laco2',
          amount: 2,
          type: TransactionType.DEBIT,
        },
      ];
      await transactionsRepository.create(transactionsToCreate[0]);
      await transactionsRepository.create(transactionsToCreate[1]);

      const response = await request(app)
        .get('/transactions')
        .set('Authorization', `bearer ${token}`)
        .send();
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body[0]).toEqual(
        expect.objectContaining(transactionsToCreate[0]),
      );
      expect(response.body[1]).toEqual(
        expect.objectContaining(transactionsToCreate[1]),
      );
    });

    it('should be able to list the transactions by type', async () => {
      const transactionsToCreate = [
        {
          user_id: 'laco',
          amount: 112,
          type: TransactionType.CREDIT,
        },
        {
          user_id: 'laco2',
          amount: 2,
          type: TransactionType.DEBIT,
        },
      ];

      await transactionsRepository.create(transactionsToCreate[0]);
      await transactionsRepository.create(transactionsToCreate[1]);

      const response = await request(app)
        .get('/transactions?type=DEBIT')
        .set('Authorization', `bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toEqual(
        expect.objectContaining(transactionsToCreate[1]),
      );
    });

    it('should be able to throw error 500 if unable to record transaction', async () => {
      const transactionToCreate = {
        user_id: 'laco',
        amount: 112,
        type: TransactionType.CREDIT,
      };

      await transactionsRepository.create(transactionToCreate);

      const response = await request(app)
        .get('/transactions?type=ERRO_TYPE')
        .set('Authorization', `bearer ${token}`)
        .send();

      expect(response.status).toBe(400);
      expect(response?.body?.message).toBe(
        'type deve ser do tipo string sendo CREDIT ou DEBIT.',
      );
    });
  });
});
