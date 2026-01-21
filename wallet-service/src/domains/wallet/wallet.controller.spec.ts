import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { CreateTransactionRequestDTO } from './dto/createTransaction.dto';
import { Transaction } from './entity/transaction.entity';

describe('WalletController', () => {
  const walletService = mockDeep<WalletService>();
  const controller = new WalletController(walletService);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call walletService.createTransaction with mapped transaction', async () => {
      const dto: CreateTransactionRequestDTO = {
        user_id: faker.number.int(),
        amount: faker.number.int({ min: 1 }),
        type: 'CREDIT',
      };

      walletService.createTransaction.mockResolvedValueOnce(undefined as any);

      const result = await controller.create(dto);

      const expectedTransaction: Transaction = {
        user_id: dto.user_id,
        amount: dto.amount,
        type: dto.type,
      };

      expect(walletService.createTransaction).toHaveBeenCalledWith(
        dto.user_id,
        expectedTransaction,
      );

      expect(result).toBeUndefined();
    });
  });

  describe('list', () => {
    it('should list all transactions when no type is provided', async () => {
      const transactions = [{ id: faker.number.int() }];

      walletService.listTransactions.mockResolvedValueOnce(transactions as any);

      const result = await controller.list();

      expect(walletService.listTransactions).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(transactions);
    });

    it('should list transactions filtered by type', async () => {
      const transactions = [{ id: faker.number.int() }];

      walletService.listTransactions.mockResolvedValueOnce(transactions as any);

      const result = await controller.list('DEBIT');

      expect(walletService.listTransactions).toHaveBeenCalledWith('DEBIT');
      expect(result).toEqual(transactions);
    });
  });

  describe('balance', () => {
    it('should return balance for user', async () => {
      const userId = faker.number.int();
      const balance = { amount: faker.number.int() };

      walletService.getBalance.mockResolvedValueOnce(balance);

      const result = await controller.balance(userId);

      expect(walletService.getBalance).toHaveBeenCalledWith(userId);
      expect(result).toEqual(balance);
    });
  });
});
