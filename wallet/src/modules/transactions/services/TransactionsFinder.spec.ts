import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
import ICreateTransactionDTO from '../dtos/ICreateTransactionDTO';
import { TransactionType } from '../infra/mongoose/entities/TransactionEntity';
import TransactionsFinder from './TransactionsFinder';

let fakeTransactionsRepository: FakeTransactionsRepository;
let transactionsFinder: TransactionsFinder;

describe('Transactions', () => {

  function createTransaction({ user_id, amount, type, }:ICreateTransactionDTO) {
    return fakeTransactionsRepository.create({
      user_id,
      amount,
      type
    });
  }

  beforeEach(() => {
    fakeTransactionsRepository = new FakeTransactionsRepository();
    transactionsFinder = new TransactionsFinder(fakeTransactionsRepository);
  });

  it('should be able to list the transactions', async () => {
    const transactionOne = await createTransaction({ user_id:'user_01', amount: 1, type: TransactionType.CREDIT });
    const transactionTwo = await createTransaction({ user_id: 'user_02', amount: 4, type: TransactionType.DEBIT });

    const transactions = await transactionsFinder.execute();

    expect(transactions).toEqual(expect.arrayContaining([transactionOne,transactionTwo]));
  });
});
