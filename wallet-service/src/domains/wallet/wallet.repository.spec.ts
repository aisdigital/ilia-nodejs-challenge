import { WalletRepository } from './wallet.repository';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/wallet-client';
import { Transaction } from './entity/transaction.entity';

describe('WalletRepository', () => {
  let repository: WalletRepository;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    repository = new WalletRepository(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('runTransaction', () => {
    it('should execute function inside prisma.$transaction', async () => {
      const tx = mockDeep<Prisma.TransactionClient>();
      const expectedResult = faker.number.int();

      prisma.$transaction.mockImplementationOnce(async (fn: any) => fn(tx));

      const result = await repository.runTransaction(
        async () => expectedResult,
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedResult);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction record', async () => {
      const tx = mockDeep<Prisma.TransactionClient>();

      const transaction: Transaction = {
        user_id: faker.number.int(),
        amount: faker.number.int({ min: 1 }),
        type: 'CREDIT',
      };

      const created = { id: faker.number.int() };

      prisma.$transaction.mockImplementationOnce(async (fn: any) => fn(tx));
      tx.transaction.create.mockResolvedValueOnce(created as any);

      const result = await repository.createTransaction(tx, transaction);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: {
          user_id: transaction.user_id,
          amount: transaction.amount,
          type: transaction.type,
        },
      });

      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return all transactions when type is not provided', async () => {
      const transactions = [{ id: faker.number.int() }];

      prisma.transaction.findMany.mockResolvedValueOnce(transactions as any);

      const result = await repository.findAll();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(transactions);
    });

    it('should filter transactions by type', async () => {
      const transactions = [{ id: faker.number.int() }];

      prisma.transaction.findMany.mockResolvedValueOnce(transactions as any);

      const result = await repository.findAll('DEBIT');

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { type: 'DEBIT' },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('findWallet', () => {
    it('should find wallet by userId', async () => {
      const tx = mockDeep<Prisma.TransactionClient>();
      const wallet = { user_id: faker.number.int(), balance: 100 };

      prisma.wallet.findUnique.mockResolvedValueOnce(wallet as any);

      const result = await repository.findWallet(tx, wallet.user_id);

      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({
        where: { user_id: wallet.user_id },
      });
      expect(result).toEqual(wallet);
    });
  });

  describe('getBalance', () => {
    it('should return aggregated balance', async () => {
      const userId = faker.number.int();
      const amount = faker.number.int();

      prisma.$queryRaw.mockResolvedValueOnce([{ amount }] as any);

      const result = await repository.getBalance(userId);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual({ amount });
    });
  });

  describe('updateBalance', () => {
    it('should update wallet balance', async () => {
      const tx = mockDeep<Prisma.TransactionClient>();
      const userId = faker.number.int();
      const balance = faker.number.int();

      const wallet = { user_id: userId, balance };

      tx.wallet.update.mockResolvedValueOnce(wallet as any);

      const result = await repository.updateBalance(tx, userId, balance);

      expect(tx.wallet.update).toHaveBeenCalledWith({
        where: { user_id: userId },
        data: { balance },
      });

      expect(result).toEqual(wallet);
    });
  });
});
