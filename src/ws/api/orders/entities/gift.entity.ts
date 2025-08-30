// gift-details.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, DeleteDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { GiftType } from '@src/common/enums';

@Entity('gift_details')
export class GiftDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: GiftType, default: GiftType.NORMAL })
  giftType: GiftType;

  @Column({ type: 'double precision', nullable: true })
  cost?: number;

  @OneToOne(() => Order, order => order.gift_details , {onDelete : 'CASCADE'})
  order: Order;

  @DeleteDateColumn()
  deleted_at?: Date;
}
