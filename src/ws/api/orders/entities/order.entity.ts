// order.entity.ts
import { User } from '@routes/users/entities/user.entity';
import { DeliveryType, OrderStatus } from '@src/common/enums';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Discount } from '../../discounts/entities/discount.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { GiftDetails } from './gift.entity';
import { TaxiDetails } from './taxi.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: DeliveryType })
  delivery_type: DeliveryType;

  

  @Column({ type: 'varchar', length: 255 })
  pickup_location: string;

  @Column({ type: 'varchar', length: 255 })
  dropoff_location: string;

  @Column({ type: 'double precision', default: 0.0 })
  pickup_lat: number;

  @Column({ type: 'double precision', default: 0.0 })
  pickup_lng: number;

  @Column({ type: 'double precision', default: 0.0 })
  dropoff_lat: number;

  @Column({ type: 'double precision', default: 0.0 })
  dropoff_lng: number;

  @OneToOne(() => TaxiDetails, taxi => taxi.order, { cascade: true, nullable: true , eager : true , onDelete : 'CASCADE' })
  @JoinColumn()
  taxi_details?: TaxiDetails;

  @ManyToOne(() => Discount, (discount) => discount.orders, { nullable: true })
  @JoinColumn({ name: 'discount_id' })
  discount?: Discount;

  @OneToOne(() => GiftDetails, gift => gift.order, { cascade: true, nullable: true , eager : true , onDelete : 'CASCADE' })
  @JoinColumn()
  gift_details?: GiftDetails;
  
  @ManyToOne(() => User, user => user.orders, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Driver, driver => driver.orders , { eager: true })
  @JoinColumn()
  driver?: Driver;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  cost: number;

  @Column({nullable : true})
  room?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable : true })
  cost_discounted?: number;

  @Column({ type: 'enum', enum: OrderStatus , default : OrderStatus.PENDING })
  order_status: OrderStatus;

  @Column({ type: 'boolean', default : false })
  rated: boolean;

  @Column({nullable : true ,})
  note ?: string;
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}