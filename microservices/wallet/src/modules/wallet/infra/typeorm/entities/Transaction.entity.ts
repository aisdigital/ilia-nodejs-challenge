/* eslint-disable @typescript-eslint/no-unsafe-call */
import { TransactionType } from '../../../domain/entities/Transaction';
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      // Ensures that the value saved in the database is a decimal number (100.00).
      from: (value: string) => parseFloat(value),
      to: (value: number) => value.toFixed(2),
    },
  })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
