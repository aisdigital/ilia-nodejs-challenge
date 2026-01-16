import { Transaction, TransactionType } from './Transaction';

describe('Transaction Entity', () => {
  it('should create a valid credit transaction', () => {
    const transaction = new Transaction({
      id: '123',
      userId: 'user-123',
      amount: 100.5,
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(transaction.id).toBe('123');
    expect(transaction.userId).toBe('user-123');
    expect(transaction.amount).toBe(100.5);
    expect(transaction.type).toBe(TransactionType.CREDIT);
  });

  it('should create a valid debit transaction', () => {
    const transaction = new Transaction({
      id: '456',
      userId: 'user-456',
      amount: 50.25,
      type: TransactionType.DEBIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(transaction.type).toBe(TransactionType.DEBIT);
    expect(transaction.amount).toBe(50.25);
  });

  it('should identify credit transaction', () => {
    const transaction = new Transaction({
      id: '123',
      userId: 'user-123',
      amount: 100,
      type: TransactionType.CREDIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(transaction.isCredit()).toBe(true);
    expect(transaction.isDebit()).toBe(false);
  });

  it('should identify debit transaction', () => {
    const transaction = new Transaction({
      id: '456',
      userId: 'user-456',
      amount: 50,
      type: TransactionType.DEBIT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(transaction.isDebit()).toBe(true);
    expect(transaction.isCredit()).toBe(false);
  });
});
