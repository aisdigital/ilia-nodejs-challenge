export type Transaction = {
  id?: string;
  user_id: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  created_at?: Date;
};
