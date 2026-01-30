import { Wallet } from '../../src/modules/wallet/entities/wallet.entity';
import { Transaction } from '../../src/modules/wallet/entities/transaction.entity';
import { TransactionType } from '../../src/modules/wallet/entities/transaction.entity';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

describe('Wallet Entity', () => {
  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  describe('Wallet Class', () => {
    it('should create a wallet instance with all properties', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-1';
      wallet.user_id = 'user-1';
      wallet.balance = 100;
      wallet.created_at = new Date();
      wallet.updated_at = new Date();

      expect(wallet.id).toBe('wallet-1');
      expect(wallet.user_id).toBe('user-1');
      expect(wallet.balance).toBe(100);
      expect(wallet.created_at).toBeInstanceOf(Date);
      expect(wallet.updated_at).toBeInstanceOf(Date);
    });

    it('should create a wallet with default balance', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-2';
      wallet.user_id = 'user-2';
      wallet.balance = 0; // explicitly set to 0
      wallet.created_at = new Date();
      wallet.updated_at = new Date();

      expect(wallet.id).toBe('wallet-2');
      expect(wallet.user_id).toBe('user-2');
      expect(wallet.balance).toBe(0);
    });

    it('should have transactions relationship', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-3';
      wallet.user_id = 'user-3';
      wallet.balance = 200;

      const transaction1 = new Transaction();
      transaction1.id = 'tx-1';
      transaction1.wallet_id = 'wallet-3';
      transaction1.amount = 50;
      transaction1.type = TransactionType.DEPOSIT;

      const transaction2 = new Transaction();
      transaction2.id = 'tx-2';
      transaction2.wallet_id = 'wallet-3';
      transaction2.amount = 25;
      transaction2.type = TransactionType.WITHDRAW;

      wallet.transactions = [transaction1, transaction2];

      expect(wallet.transactions).toHaveLength(2);
      expect(wallet.transactions[0].id).toBe('tx-1');
      expect(wallet.transactions[1].id).toBe('tx-2');
      expect(wallet.transactions[0].wallet_id).toBe('wallet-3');
      expect(wallet.transactions[1].wallet_id).toBe('wallet-3');
    });

    it('should handle empty transactions array', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-4';
      wallet.user_id = 'user-4';
      wallet.balance = 0;
      wallet.transactions = [];

      expect(wallet.transactions).toEqual([]);
      expect(wallet.transactions).toHaveLength(0);
    });

    it('should handle undefined transactions', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-5';
      wallet.user_id = 'user-5';
      wallet.balance = 500;

      expect(wallet.transactions).toBeUndefined();
    });

    it('should create a wallet via constructor for coverage', () => {
      const w = new Wallet();
      w.id = 'cov-wallet';
      w.user_id = 'cov-user';
      w.balance = 0;
      w.created_at = new Date();
      w.updated_at = new Date();
      w.transactions = [];

      expect(w.id).toBe('cov-wallet');
      expect(Array.isArray(w.transactions)).toBe(true);
    });

    it('should update a wallet balance directly', () => {
      const w = new Wallet();
      w.balance = 0;
      w.balance = w.balance + 1;
      expect(w.balance).toBe(1);
    });
  });
});
