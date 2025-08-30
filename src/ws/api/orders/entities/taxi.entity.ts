// taxi-details.entity.ts
import { PreferredGender } from '@src/common/enums';
import { Column, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('taxi_details')
export class TaxiDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'enum', enum: PreferredGender, default: PreferredGender.ANY })
  passengersGender: PreferredGender;

  @Column({ type: 'enum', enum: PreferredGender, default: PreferredGender.ANY })
  driverGender: PreferredGender;

  @Column({ type: 'int', default: 0 })
  male: number;

  @Column({ type: 'int', default: 0 })
  female: number;

  @OneToOne(() => Order, order => order.taxi_details , {onDelete : "CASCADE"})
  order: Order;

  @DeleteDateColumn()
  deleted_at?: Date;
}
