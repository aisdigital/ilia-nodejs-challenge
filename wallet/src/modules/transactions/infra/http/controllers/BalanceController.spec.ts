import TransactionsRepository from '@modules/transactions/infra/mongoose/repositories/TransactionsRepository';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import app from '@shared/infra/http/app';
import { TransactionType } from '../../mongoose/entities/TransactionEntity';

let transactionsRepository: TransactionsRepository;

describe('BalanceController', () => {
  beforeEach(() => {
    transactionsRepository = new TransactionsRepository();
  });

  it('should be able to return correct balance', async () => {
    await transactionsRepository.create({
      user_id: 'laco',
      amount: 10,
      type: TransactionType.CREDIT,
    });

    await transactionsRepository.create({
      user_id: 'laco2',
      amount: 5,
      type: TransactionType.DEBIT,
    });
    const response = await request(app).get('/balance').send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ amount: 5 });
  });
});
