import { TransactionEntity } from '../../../../../src/core/domain/entities/transaction.entity';
import { TransactionType } from '../../../../../src/core/domain/enum/transaction-type.enum';

describe('TransactionEntity', () => {
  it('should create a valid transaction entity', () => {
    const transaction = new TransactionEntity({
      user_id: '507f1f77bcf86cd799439011',
      amount: 10000,
      type: TransactionType.CREDIT,
    });

    expect(transaction.user_id).toBe('507f1f77bcf86cd799439011');
    expect(transaction.amount).toBe(10000);
    expect(transaction.type).toBe(TransactionType.CREDIT);
  });

  it('should throw error when user_id is missing', () => {
    expect(() => {
      new TransactionEntity({
        user_id: '',
        amount: 10000,
        type: TransactionType.CREDIT,
      });
    }).toThrow('user_id is required');
  });

  it('should throw error when amount is zero or negative', () => {
    expect(() => {
      new TransactionEntity({
        user_id: '507f1f77bcf86cd799439011',
        amount: 0,
        type: TransactionType.CREDIT,
      });
    }).toThrow('amount must be greater than zero');

    expect(() => {
      new TransactionEntity({
        user_id: '507f1f77bcf86cd799439011',
        amount: -100,
        type: TransactionType.CREDIT,
      });
    }).toThrow('amount must be greater than zero');
  });

  it('should check if transaction is credit', () => {
    const transaction = new TransactionEntity({
      user_id: '507f1f77bcf86cd799439011',
      amount: 10000,
      type: TransactionType.CREDIT,
    });

    expect(transaction.isCredit()).toBe(true);
    expect(transaction.isDebit()).toBe(false);
  });

  it('should check if transaction is debit', () => {
    const transaction = new TransactionEntity({
      user_id: '507f1f77bcf86cd799439011',
      amount: 5000,
      type: TransactionType.DEBIT,
    });

    expect(transaction.isDebit()).toBe(true);
    expect(transaction.isCredit()).toBe(false);
  });
});
