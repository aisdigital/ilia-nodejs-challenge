import { WalletEntity } from '../../../../../src/core/domain/entities/wallet.entity';

describe('WalletEntity', () => {
  it('should create a wallet with initial balance', () => {
    const wallet = new WalletEntity('user123', 5000);

    expect(wallet.userId).toBe('user123');
    expect(wallet.balance).toBe(5000);
  });

  it('should create a wallet with zero balance by default', () => {
    const wallet = new WalletEntity('user123');

    expect(wallet.balance).toBe(0);
  });

  it('should credit amount to wallet', () => {
    const wallet = new WalletEntity('user123', 1000);

    wallet.credit(500);

    expect(wallet.balance).toBe(1500);
  });

  it('should throw error when crediting zero or negative amount', () => {
    const wallet = new WalletEntity('user123', 1000);

    expect(() => wallet.credit(0)).toThrow('credit amount must be greater than zero');
    expect(() => wallet.credit(-100)).toThrow('credit amount must be greater than zero');
  });

  it('should debit amount from wallet', () => {
    const wallet = new WalletEntity('user123', 1000);

    wallet.debit(300);

    expect(wallet.balance).toBe(700);
  });

  it('should throw error when debiting zero or negative amount', () => {
    const wallet = new WalletEntity('user123', 1000);

    expect(() => wallet.debit(0)).toThrow('debit amount must be greater than zero');
    expect(() => wallet.debit(-100)).toThrow('debit amount must be greater than zero');
  });

  it('should check if wallet has sufficient balance', () => {
    const wallet = new WalletEntity('user123', 1000);

    expect(wallet.hasBalance(500)).toBe(true);
    expect(wallet.hasBalance(1000)).toBe(true);
    expect(wallet.hasBalance(1500)).toBe(false);
  });
});