import TransactionsRepository from '@modules/transactions/infra/mongoose/repositories/TransactionsRepository';
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import app from '@shared/infra/http/app';
import TransactionEntity, {
  TransactionType,
} from '../../mongoose/entities/TransactionEntity';

let transactionsRepository: TransactionsRepository;

describe('BalanceController', () => {
  beforeAll(() => {
    transactionsRepository = new TransactionsRepository();
  });

  beforeEach(async () => {
    await TransactionEntity.deleteMany({}).exec();
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

  it('should be able to return { amount: 0 } if no transactions exist', async () => {
    const response = await request(app).get('/balance').send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ amount: 0 });
  });
});
