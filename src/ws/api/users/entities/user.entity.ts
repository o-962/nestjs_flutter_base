import { Gender } from "@src/common/enums";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "../../orders/entities/order.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id : string;
  @Column({nullable : true })
  gender : Gender;
  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
  @Column({ type: 'date', nullable: true })
  birthdate: Date;
  
  @OneToMany(() => Order, order => order.user)
  orders: Order[];
  
  @Column({ type: 'text', nullable: true })
  bio: string;
}