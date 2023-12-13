import { TransactionSchemaType } from '../types/wallet';
import { walletDB } from '../utils/db';

export const createTransaction = async (transaction: TransactionSchemaType) => {
  const createTransaction = await walletDB.transaction.create({
    data: transaction,
    select: {
      amount: true,
      id: true,
      user_id: true,
      type: true,
    },
  });

  return createTransaction;
};
