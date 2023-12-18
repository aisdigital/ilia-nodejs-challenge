import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the wallet' })
  id: number;

  @Column({ default: 0 })
  @ApiProperty({ description: 'The balance of the wallet', example: 100 })
  balance: number;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];
}
