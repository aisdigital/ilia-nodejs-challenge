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

describe('BalanceController', () => {
  beforeAll(() => {
    token = sign({}, authConfig.jwt.secret);
    transactionsRepository = new TransactionsRepository();
  });

  beforeEach(async () => {
    await TransactionEntity.deleteMany({}).exec();
  });

  it('should be able to require authentication when trying to calculate balance', async () => {
    const response = await request(app).get('/balance').send();
    expect(response.status).toBe(401);
    expect(response?.body?.message).toBe(
      'Favor, é preciso estar logado para continuar',
    );
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
    const response = await request(app)
      .get('/balance')
      .set('Authorization', `bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ amount: 5 });
  });

  it('should be able to return { amount: 0 } if no transactions exist', async () => {
    const response = await request(app)
      .get('/balance')
      .set('Authorization', `bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ amount: 0 });
  });
});
