import { BadRequestException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { mockDeep } from 'jest-mock-extended';

import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';
import { CreateTransactionRequestDTO } from './dto/createTransaction.dto';

describe('WalletService', () => {
  const walletRepository = mockDeep<WalletRepository>();
  const service = new WalletService(walletRepository);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create CREDIT transaction and update balance', async () => {
      const userId = faker.number.int();
      const wallet = {
        user_id: userId,
        balance: 100,
      };

      const dto: CreateTransactionRequestDTO = {
        user_id: userId,
        amount: 50,
        type: 'CREDIT',
      };

      walletRepository.runTransaction.mockImplementationOnce(async (fn) =>
        fn({} as any),
      );

      walletRepository.findWallet.mockResolvedValueOnce(wallet as any);
      walletRepository.createTransaction.mockResolvedValueOnce(
        undefined as any,
      );
      walletRepository.updateBalance.mockResolvedValueOnce(undefined as any);

      await service.createTransaction(userId, dto);

      expect(walletRepository.runTransaction).toHaveBeenCalledTimes(1);
      expect(walletRepository.findWallet).toHaveBeenCalledWith(
        expect.anything(),
        userId,
      );

      expect(walletRepository.createTransaction).toHaveBeenCalledWith(
        expect.anything(),
        {
          user_id: userId,
          amount: dto.amount,
          type: dto.type,
        },
      );

      expect(walletRepository.updateBalance).toHaveBeenCalledWith(
        expect.anything(),
        userId,
        150,
      );
    });

    it('should create DEBIT transaction when balance is sufficient', async () => {
      const userId = faker.number.int();
      const wallet = {
        user_id: userId,
        balance: 200,
      };

      const dto: CreateTransactionRequestDTO = {
        user_id: userId,
        amount: 80,
        type: 'DEBIT',
      };

      walletRepository.runTransaction.mockImplementationOnce(async (fn) =>
        fn({} as any),
      );

      walletRepository.findWallet.mockResolvedValueOnce(wallet as any);
      walletRepository.createTransaction.mockResolvedValueOnce(
        undefined as any,
      );
      walletRepository.updateBalance.mockResolvedValueOnce(undefined as any);

      await service.createTransaction(userId, dto);

      expect(walletRepository.updateBalance).toHaveBeenCalledWith(
        expect.anything(),
        userId,
        120,
      );
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      const userId = faker.number.int();

      const dto: CreateTransactionRequestDTO = {
        user_id: userId,
        amount: 50,
        type: 'CREDIT',
      };

      walletRepository.runTransaction.mockImplementationOnce(async (fn) =>
        fn({} as any),
      );

      walletRepository.findWallet.mockResolvedValueOnce(null);

      await expect(service.createTransaction(userId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(walletRepository.createTransaction).not.toHaveBeenCalled();
      expect(walletRepository.updateBalance).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when balance is insufficient', async () => {
      const userId = faker.number.int();
      const wallet = {
        user_id: userId,
        balance: 20,
      };

      const dto: CreateTransactionRequestDTO = {
        user_id: userId,
        amount: 100,
        type: 'DEBIT',
      };

      walletRepository.runTransaction.mockImplementationOnce(async (fn) =>
        fn({} as any),
      );

      walletRepository.findWallet.mockResolvedValueOnce(wallet as any);

      await expect(service.createTransaction(userId, dto)).rejects.toThrow(
        BadRequestException,
      );

      expect(walletRepository.createTransaction).not.toHaveBeenCalled();
      expect(walletRepository.updateBalance).not.toHaveBeenCalled();
    });
  });

  describe('listTransactions', () => {
    it('should return all transactions', async () => {
      const transactions = [{ id: faker.number.int() }];

      walletRepository.findAll.mockResolvedValueOnce(transactions as any);

      const result = await service.listTransactions();

      expect(walletRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(transactions);
    });

    it('should return filtered transactions by type', async () => {
      const transactions = [{ id: faker.number.int() }];

      walletRepository.findAll.mockResolvedValueOnce(transactions as any);

      const result = await service.listTransactions('CREDIT');

      expect(walletRepository.findAll).toHaveBeenCalledWith('CREDIT');
      expect(result).toEqual(transactions);
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      const userId = faker.number.int();
      const wallet = { amount: 500 };

      walletRepository.getBalance.mockResolvedValueOnce(wallet as any);

      const result = await service.getBalance(userId);

      expect(walletRepository.getBalance).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ amount: 500 });
    });

    it('should throw NotFoundException when wallet does not exist', async () => {
      const userId = faker.number.int();

      walletRepository.getBalance.mockResolvedValueOnce(null as any);

      await expect(service.getBalance(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
