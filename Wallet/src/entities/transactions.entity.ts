import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Transactions } from '@interfaces/transactions.interface';

@Entity()
export class TransactionsEntity extends BaseEntity implements Transactions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ default: true })
  activated: boolean;

  @Column()
  amount: number;

  @Column()
  type: string;
}
