import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

@Entity()
@Index(['user_id', 'created_at'])
export class Transaction {
  @ApiProperty({
    description: 'Transaction unique identifier',
    type: String,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User unique identifier',
    type: String,
  })
  @Column()
  @Index()
  user_id: string;

  @ApiProperty({
    description: 'Type of the transaction: CREDIT or DEBIT',
    enum: TransactionType,
  })
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.CREDIT,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Amount of the transaction in cents',
    type: Number,
  })
  @Column({ type: 'integer', comment: 'Amount in cents' })
  amount: number;

  @ApiProperty({
    description: 'Status of the transaction',
    enum: TransactionStatus,
  })
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  @Index()
  status: TransactionStatus;

  @ApiProperty({
    description: 'Retry count for failed transactions',
    type: Number,
  })
  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @ApiProperty({
    description: 'Error message if transaction failed',
    type: String,
    required: false,
  })
  @Column({ nullable: true, type: 'text' })
  error_message: string | null;

  @ApiProperty({
    description: 'Hash for deduplication based on request fingerprint',
    type: String,
    required: false,
  })
  @Column({ nullable: true })
  @Index()
  request_hash: string | null;

  @ApiProperty({
    description: 'Timestamp when the transaction was processed',
    type: Date,
    required: false,
  })
  @Column({ nullable: true, type: 'timestamp' })
  processed_at: Date | null;

  @ApiProperty({
    description: 'Timestamp when the transaction was created',
    type: Date,
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Timestamp when the transaction was last updated',
    type: Date,
  })
  @UpdateDateColumn()
  updated_at: Date;
}
