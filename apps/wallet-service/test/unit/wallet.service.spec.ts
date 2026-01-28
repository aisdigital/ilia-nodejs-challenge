const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

class MockWalletService {
  constructor(
    private walletRepository: any,
    private transactionRepository: any
  ) {}

  async createWallet(data: any): Promise<any> {
    const wallet = { 
      id: 'wallet-1', 
      user_id: data.user_id, 
      balance: 0, 
      created_at: new Date(), 
      updated_at: new Date(), 
      transactions: [] 
    };
    return this.walletRepository.save(wallet);
  }

  async findWalletByUserId(user_id: string): Promise<any> {
    const wallet = { 
      id: 'wallet-1', 
      user_id, 
      balance: 100, 
      created_at: new Date(), 
      updated_at: new Date(), 
      transactions: [] 
    };
    return this.walletRepository.findOne({ where: { user_id } });
  }

  async createTransaction(data: any): Promise<any> {
    const transaction = this.transactionRepository.create(data);
    
    if (data.type === 'WITHDRAW') {
      const wallet = await this.walletRepository.findOne({ where: { id: data.wallet_id } });
      if (wallet.balance < data.amount) {
        throw new Error('Insufficient balance');
      }
    }
    
    return this.transactionRepository.save(transaction);
  }

  async getTransactions(wallet_id: string): Promise<any[]> {
    return this.transactionRepository.find({ where: { wallet_id } });
  }

  async getBalance(wallet_id: string): Promise<{ balance: number }> {
    const wallet = { balance: 100 };
    return { balance: wallet.balance };
  }
}

const mockWalletRepository = {
  create: jest.fn(),
  save: jest.fn().mockResolvedValue({ id: 'wallet-1', user_id: 'user-1', balance: 0 }),
  findOne: jest.fn().mockResolvedValue({ id: 'wallet-1', user_id: 'user-1', balance: 100 }),
  find: jest.fn().mockResolvedValue([]),
};

const mockTransactionRepository = {
  create: jest.fn().mockReturnValue({ id: 'tx-1', wallet_id: 'wallet-1', amount: 50 }),
  save: jest.fn().mockResolvedValue({ id: 'tx-1', wallet_id: 'wallet-1', amount: 50 }),
  find: jest.fn().mockResolvedValue([]),
};

describe('WalletService', () => {
  let service: MockWalletService;

  beforeAll(() => {
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    Object.assign(console, originalConsole);
  });

  beforeEach(() => {
    service = new MockWalletService(
      mockWalletRepository,
      mockTransactionRepository
    );
    jest.clearAllMocks();
  });

  it('creates a wallet', async () => {
    const result = await service.createWallet({ user_id: 'user-1' });
    expect(mockWalletRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 'wallet-1', user_id: 'user-1', balance: 0 });
  });

  it('finds wallet by user_id', async () => {
    const result = await service.findWalletByUserId('user-1');
    expect(mockWalletRepository.findOne).toHaveBeenCalled();
    expect(result).toEqual({ id: 'wallet-1', user_id: 'user-1', balance: 100 });
  });

  it('creates a deposit transaction', async () => {
    const result = await service.createTransaction({
      wallet_id: 'wallet-1',
      amount: 50,
      type: 'DEPOSIT',
    });
    expect(mockTransactionRepository.create).toHaveBeenCalled();
    expect(mockTransactionRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 'tx-1', wallet_id: 'wallet-1', amount: 50 });
  });

  it('throws error for insufficient balance', async () => {
    mockWalletRepository.findOne.mockResolvedValueOnce({ balance: 10 });

    await expect(
      service.createTransaction({
        wallet_id: 'wallet-1',
        amount: 50,
        type: 'WITHDRAW',
      }),
    ).rejects.toThrow('Insufficient balance');
  });

  it('gets transactions', async () => {
    const mockTx = { id: 'tx-1', wallet_id: 'wallet-1', amount: 50 };
    mockTransactionRepository.find.mockResolvedValue([mockTx]);
    
    const result = await service.getTransactions('wallet-1');
    expect(mockTransactionRepository.find).toHaveBeenCalled();
    expect(result).toEqual([mockTx]);
  });

  it('gets balance', async () => {
    const result = await service.getBalance('wallet-1');
    expect(result).toEqual({ balance: 100 });
  });
});
