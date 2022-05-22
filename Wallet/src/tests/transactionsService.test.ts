import { dbConnection } from '@databases';
import { CreateTransactionDto } from '@dtos/transactions.dto';
import TransactionsService from '@services/transactions.service';
import connection from './connection';

beforeAll(async () => {
  await connection.create(dbConnection);
  await connection.clear();
});

afterAll(async () => {
  await connection.clear();
  await connection.close();
});

describe('Testing User Service', () => {
  describe('create transaction', () => {
    it('response should have the Create userData', async () => {
      const transactionsService = new TransactionsService();

      const userData: CreateTransactionDto = {
        user_id: '61ede14f77302924b82c3e80',
        amount: 58,
        type: 'DEBIT',
      };

      const transaction = await transactionsService.createTransaction(userData);

      expect(transaction).not.toBeUndefined();
      expect(transaction).toHaveProperty('user_id');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('type');
      expect(transaction).toHaveProperty('id');
    });
  });

  describe('filter transactions', () => {
    it('filter by debit', async () => {
      const transactionsService = new TransactionsService();

      const transaction: any[] = await transactionsService.findTransactionByType('debit');

      expect(transaction.length).toBe(1);
      expect(transaction[0]).toHaveProperty('user_id');
      expect(transaction[0]).toHaveProperty('amount');
      expect(transaction[0]).toHaveProperty('type');
    });
  });
});
