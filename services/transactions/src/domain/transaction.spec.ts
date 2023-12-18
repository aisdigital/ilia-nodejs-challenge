import { v4 as uuid } from 'uuid';
import { describe, it, expect } from '@jest/globals';

import { TransactionType } from './transaction-type.enum.js';
import { Transaction } from './transactions.js';
import { InvalidAmountError } from './errors/invalid-amount-error.js';

describe('Transaction', () => {
  it('creates a credit transaction', async () => {
    const userId = uuid();

    const credit = new Transaction({
      type: TransactionType.CREDIT,
      amount: 100,
      userId,
    });

    expect(credit).toBeInstanceOf(Transaction);
    expect(credit.type).toBe(TransactionType.CREDIT);
    expect(credit.amount).toBe(100);
    expect(credit.userId).toBe(userId);
    expect(credit.balanceChange).toBe(100);
  });

  it('creates a debit transaction', async () => {
    const userId = uuid();

    const credit = new Transaction({
      type: TransactionType.DEBIT,
      amount: 100,
      userId,
    });

    expect(credit).toBeInstanceOf(Transaction);
    expect(credit.type).toBe(TransactionType.DEBIT);
    expect(credit.amount).toBe(100);
    expect(credit.userId).toBe(userId);
    expect(credit.balanceChange).toBe(-100);
  });

  it('throws an error when amount is less than 0', async () => {
    expect(
      () =>
        new Transaction({
          type: TransactionType.DEBIT,
          amount: -100,
          userId: uuid(),
        })
    ).toThrow(InvalidAmountError);
  });
});
