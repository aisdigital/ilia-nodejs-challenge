import { WalletController } from '../../src/modules/wallet/wallet.controller';
import { TransactionType } from '../../src/modules/wallet/entities/transaction.entity';

const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

interface MockWallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
  transactions: any[];
}

interface MockTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  created_at: Date;
  updated_at: Date;
  wallet: MockWallet;
}

const mockWallet: MockWallet = {
  id: 'wallet-1',
  user_id: 'user-1',
  balance: 100,
  created_at: new Date(),
  updated_at: new Date(),
  transactions: [],
};

const mockTransaction: MockTransaction = {
  id: 'tx-1',
  wallet_id: 'wallet-1',
  amount: 50,
  type: TransactionType.DEPOSIT,
  description: 'Test deposit',
  created_at: new Date(),
  updated_at: new Date(),
  wallet: mockWallet,
};

const mockWalletService = {
  createWallet: jest.fn().mockResolvedValue(mockWallet),
  findWalletByUserId: jest.fn().mockResolvedValue(mockWallet),
  createTransaction: jest.fn().mockResolvedValue(mockTransaction),
  getTransactions: jest.fn().mockResolvedValue([mockTransaction]),
  getBalance: jest.fn().mockResolvedValue({ balance: 100 }),
};

describe('WalletController', () => {
  let controller: WalletController;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(() => {
    controller = new WalletController(mockWalletService as any);
    jest.clearAllMocks();
  });

  it('creates a wallet', async () => {
    const result = await controller.createWallet({ user_id: 'user-1' });
    expect(mockWalletService.createWallet).toHaveBeenCalled();
    expect(result).toEqual(mockWallet);
  });

  it('gets wallet by user_id', async () => {
    const result = await controller.findWalletByUserId('user-1');
    expect(mockWalletService.findWalletByUserId).toHaveBeenCalled();
    expect(result).toEqual(mockWallet);
  });

  it('creates a deposit transaction', async () => {
    const result = await controller.createTransaction('wallet-1', {
      amount: 50,
      type: TransactionType.DEPOSIT,
      wallet_id: 'wallet-1',
    });
    expect(mockWalletService.createTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });

  it('creates a withdraw transaction', async () => {
    const result = await controller.createTransaction('wallet-1', {
      amount: 30,
      type: TransactionType.WITHDRAW,
      wallet_id: 'wallet-1',
    });
    expect(mockWalletService.createTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockTransaction);
  });

  it('gets transactions', async () => {
    const result = await controller.getTransactions('wallet-1');
    expect(mockWalletService.getTransactions).toHaveBeenCalled();
    expect(result).toEqual([mockTransaction]);
  });

  it('gets balance', async () => {
    const result = await controller.getBalance('wallet-1');
    expect(mockWalletService.getBalance).toHaveBeenCalled();
    expect(result).toEqual({ balance: 100 });
  });
});
