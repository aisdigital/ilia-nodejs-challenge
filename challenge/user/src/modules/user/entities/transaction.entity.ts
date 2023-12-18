import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './wallet.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'The unique identifier of the transaction' })
  id: number;

  @Column()
  @ApiProperty({ description: 'The amount of the transaction', example: 50 })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Timestamp of the transaction' })
  timestamp: Date;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;
}
