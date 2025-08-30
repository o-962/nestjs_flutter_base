import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { DeliveryType } from '@src/common/enums';

export type DiscountType = 'percent' | 'fixed';


@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-array', nullable: true })
  applicable_to?: DeliveryType[]; // e.g., ['TAXI','GIFTS']

  @Column({ type: 'enum', enum: ['percent', 'fixed'], default: 'percent' })
  type: DiscountType; 
  @Column({ type: 'varchar', length: 100 })
  code: string; // discount code like WELCOME10

  @Column({ type: 'float', nullable: false })
  percentage: number; // percentage discount, e.g., 10 for 10%

  @Column({ type: 'float', nullable: true })
  max_amount: number | null; // max discount allowed

  @Column({ type: 'timestamp', nullable: false })
  start_date: Date; // discount start date

  @Column({ type: 'timestamp', nullable: false })
  end_date: Date; // discount end date

  @Column({ type: 'int', default: 0 })
  usage_limit: number; // how many times this discount can be used

  @Column({ type: 'int', default: 0 })
  used_count: number; // how many times it has been used

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // discount active or not

  @OneToMany(() => Order, (order) => order.discount)
  orders: Order[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
