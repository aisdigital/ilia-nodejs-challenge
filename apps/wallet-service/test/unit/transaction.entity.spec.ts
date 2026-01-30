import { TransactionType, Transaction } from '../../src/modules/wallet/entities/transaction.entity';
import { Wallet } from '../../src/modules/wallet/entities/wallet.entity';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

describe('Transaction Entity', () => {
  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  describe('TransactionType Enum', () => {
    it('should have correct enum values', () => {
      expect(TransactionType.DEPOSIT).toBe('deposit');
      expect(TransactionType.WITHDRAW).toBe('withdraw');
      expect(TransactionType.TRANSFER).toBe('transfer');
    });
  });

  describe('Transaction Class', () => {
    it('should create a transaction instance with all properties', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-1';
      wallet.user_id = 'user-1';
      wallet.balance = 100;

      const transaction = new Transaction();
      transaction.id = 'tx-1';
      transaction.wallet_id = 'wallet-1';
      transaction.amount = 50;
      transaction.type = TransactionType.DEPOSIT;
      transaction.description = 'Test transaction';
      transaction.created_at = new Date();
      transaction.updated_at = new Date();
      transaction.wallet = wallet;

      expect(transaction.id).toBe('tx-1');
      expect(transaction.wallet_id).toBe('wallet-1');
      expect(transaction.amount).toBe(50);
      expect(transaction.type).toBe(TransactionType.DEPOSIT);
      expect(transaction.description).toBe('Test transaction');
      expect(transaction.created_at).toBeInstanceOf(Date);
      expect(transaction.updated_at).toBeInstanceOf(Date);
      expect(transaction.wallet).toBe(wallet);
    });

    it('should create a transaction without description', () => {
      const transaction = new Transaction();
      transaction.id = 'tx-2';
      transaction.wallet_id = 'wallet-1';
      transaction.amount = 100;
      transaction.type = TransactionType.WITHDRAW;
      transaction.created_at = new Date();
      transaction.updated_at = new Date();

      expect(transaction.id).toBe('tx-2');
      expect(transaction.wallet_id).toBe('wallet-1');
      expect(transaction.amount).toBe(100);
      expect(transaction.type).toBe(TransactionType.WITHDRAW);
      expect(transaction.description).toBeUndefined();
    });

    it('should handle transfer transaction type', () => {
      const transaction = new Transaction();
      transaction.id = 'tx-3';
      transaction.wallet_id = 'wallet-2';
      transaction.amount = 75;
      transaction.type = TransactionType.TRANSFER;
      transaction.description = 'Transfer to another wallet';

      expect(transaction.type).toBe(TransactionType.TRANSFER);
      expect(transaction.amount).toBe(75);
    });

    it('should have wallet relationship', () => {
      const wallet = new Wallet();
      wallet.id = 'wallet-3';
      wallet.user_id = 'user-3';
      wallet.balance = 200;

      const transaction = new Transaction();
      transaction.wallet = wallet;

      expect(transaction.wallet).toBe(wallet);
      expect(transaction.wallet.id).toBe('wallet-3');
      expect(transaction.wallet.balance).toBe(200);
    });

    it('should create a transaction via constructor for coverage', () => {
      const t = new Transaction();
      t.id = 'cov-tx';
      t.wallet_id = 'cov-wallet';
      t.amount = 0;
      t.type = TransactionType.DEPOSIT;
      t.created_at = new Date();
      t.updated_at = new Date();

      expect(t.id).toBe('cov-tx');
      expect(t.type).toBe(TransactionType.DEPOSIT);
    });

    it('should update transaction amount directly', () => {
      const t = new Transaction();
      t.amount = 0;
      t.amount = t.amount + 1;
      expect(t.amount).toBe(1);
    });
  });
});
