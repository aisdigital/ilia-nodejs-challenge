import { dbConnection } from '@databases';
import { CreateTransactionDto } from '@dtos/transactions.dto';
import TransactionsService from '@services/transactions.service';
import BalanceService from '@services/balance.service';
import connection from './connection';

beforeAll(async () => {
  await connection.create(dbConnection);
  await connection.clear();
});

afterAll(async () => {
  await connection.clear();
  await connection.close();
});

describe('Testing Balance Service', () => {
  describe('create transaction', () => {
    it('response should have the Create userData', async () => {
      const transactionsService = new TransactionsService();
      const balanceService = new BalanceService();

      const transactionData: CreateTransactionDto = {
        user_id: '61ede14f77302924b82c3e80',
        amount: 58,
        type: 'DEBIT',
      };

      const transactionDataCredit: CreateTransactionDto = {
        user_id: '61ede14f77302924b82c3e80',
        amount: 57,
        type: 'CREDIT',
      };

      await transactionsService.createTransaction(transactionData);
      await transactionsService.createTransaction(transactionDataCredit);
      const total = await balanceService.calculateAmount();

      expect(total.amount).toBe('1');
    });
  });
});
