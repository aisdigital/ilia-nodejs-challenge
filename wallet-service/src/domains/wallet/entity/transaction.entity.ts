export type Transaction = {
  id?: string;
  user_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  created_at?: Date;
};
