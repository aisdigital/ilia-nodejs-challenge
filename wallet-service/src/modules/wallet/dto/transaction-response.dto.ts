import { TransactionType } from "../entities/transaction.entity.js";

export interface TransactionResponseDTO {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: Date;
}
