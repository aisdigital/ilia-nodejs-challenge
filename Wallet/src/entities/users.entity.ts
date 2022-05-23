import { User } from '@/interfaces/user.interface';
import { BaseEntity, Entity, UpdateDateColumn, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryColumn()
  id: string;

  @Column({ default: true })
  activated: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
