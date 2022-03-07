import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
import { TransactionType } from '../infra/mongoose/entities/TransactionEntity';
import TransactionsCreator from './TransactionsCreator';

let fakeTransactionsRepository: FakeTransactionsRepository;
let transactionsCreator: TransactionsCreator;

describe('TransactionsCreator', () => {
  beforeEach(() => {
    fakeTransactionsRepository = new FakeTransactionsRepository();
    transactionsCreator = new TransactionsCreator(fakeTransactionsRepository);
  });

  it('should be able to create the transaction', async () => {
    const transaction = await transactionsCreator.execute({
      user_id: 'user_01',
      amount: 1,
      type: TransactionType.CREDIT,
    });

    expect(transaction).toEqual(
      expect.objectContaining({
        user_id: 'user_01',
        amount: 1,
        type: TransactionType.CREDIT,
      }),
    );
  });
});
