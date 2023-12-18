import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import axios from 'axios';

jest.mock('axios');

describe('WalletService', () => {
  let walletService: WalletService;
  let walletRepository: Repository<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Wallet),
          useClass: Repository,
        },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
  });

  describe('deposit', () => {
    it('should deposit into the wallet successfully', async () => {
      const walletId = 1;
      const depositData = { balance: 100 };

      const walletMock: Wallet = {
        id: walletId,
        balance: 50,
      };

      const axiosPostMock = jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: walletMock });

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(walletMock);
      const saveSpy = jest.spyOn(walletRepository, 'save').mockResolvedValueOnce(walletMock);

      const result = await walletService.deposit(walletId, depositData);

      expect(result).toEqual(walletMock);
      expect(axiosPostMock).toHaveBeenCalledWith(`https://localhost:3002/api/wallets/${walletId}/deposit`, {
        amount: depositData.balance,
      });
      expect(saveSpy).toHaveBeenCalledWith(walletMock);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 1;
      const depositData = { balance: 100 };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(walletService.deposit(walletId, depositData)).rejects.toThrowError(
        new NotFoundException('Wallet not found'),
      );
    });

    it('should throw an error if deposit fails', async () => {
      const walletId = 1;
      const depositData = { balance: 100 };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce({ id: walletId, balance: 50 });

      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Deposit failed'));

      await expect(walletService.deposit(walletId, depositData)).rejects.toThrowError(
        new Error('Failed to deposit: Deposit failed'),
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw from the wallet successfully', async () => {
      const walletId = 1;
      const withdrawalData = { amount: 30 };

      const walletMock: Wallet = {
        id: walletId,
        balance: 50,
      };

      const axiosPostMock = jest.spyOn(axios, 'post').mockResolvedValueOnce({ data: walletMock });

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(walletMock);
      const saveSpy = jest.spyOn(walletRepository, 'save').mockResolvedValueOnce(walletMock);

      const result = await walletService.withdraw(walletId, withdrawalData);

      expect(result).toEqual(walletMock);
      expect(axiosPostMock).toHaveBeenCalledWith(`https://localhost:3002/api/wallets/${walletId}/withdraw`, {
        walletId,
        withdrawalAmount: withdrawalData.amount,
      });
      expect(saveSpy).toHaveBeenCalledWith(walletMock);
    });

    it('should throw NotFoundException if wallet not found', async () => {
      const walletId = 1;
      const withdrawalData = { amount: 30 };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(walletService.withdraw(walletId, withdrawalData)).rejects.toThrowError(
        new NotFoundException('Wallet not found'),
      );
    });

    it('should throw NotFoundException if insufficient funds', async () => {
      const walletId = 1;
      const withdrawalData = { amount: 70 };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce({ id: walletId, balance: 50 });

      await expect(walletService.withdraw(walletId, withdrawalData)).rejects.toThrowError(
        new NotFoundException('Insufficient funds'),
      );
    });

    it('should throw an error if withdrawal fails', async () => {
      const walletId = 1;
      const withdrawalData = { amount: 30 };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce({ id: walletId, balance: 50 });

      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Withdrawal failed'));

      await expect(walletService.withdraw(walletId, withdrawalData)).rejects.toThrowError(
        new Error('Failed to withdraw: Withdrawal failed'),
      );
    });
  });
});
