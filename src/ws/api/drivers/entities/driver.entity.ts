import { DriverStatus, Gender, PreferredGender } from "@src/common/enums";
import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";


@Entity()
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id : string;
  
  @Column({ type : "double precision"})
  lat:number;

  @Column({type : "double precision"})
  lng:number;

  @Column({type : "enum" , enum : Gender})
  gender : Gender;

  @Column({type : "enum" , enum : PreferredGender})
  preferred_passengers : PreferredGender;

  @Column({ unique: true })
  driver_phone_number: string ;
  
  @Column({ unique: true , nullable : true })
  driver_image: string;

  @Column({ unique: false , nullable : true })
  driver_other_phone_number: string;

  @Column({ type: "enum", enum: DriverStatus, default: DriverStatus.OFFLINE })
  status: DriverStatus;

  @Column("text", { array: true, default: () => "ARRAY[]::text[]"  })
  excluded_areas: string[];

  @Column({ type: "float", default: 1 })
  rating: number;

  @Column({ type: "int", default: 0 })
  total_trips: number;

  @Column({ type: "float", default: 0 } )
  balance: number;

  @Column({type : "numeric" , nullable : false})
  car_seats : number;

  @Column({type : "numeric" , nullable : false})
  max_seats : number;

  @Column({type : "numeric" , nullable : false})
  min_seats : number;

  @Column({type : "numeric" , nullable : false})
  pick_radius : number;

  @OneToMany(() => Driver, driver => driver.orders)
  orders: Driver;

  @Column({ nullable: true , unique : true })
  driver_license_number: string;

  @Column({ nullable: true , unique : true })
  driver_license_image: string;
  
  @Column({ nullable: true , unique : true })
  vehicle_image : string;


  @Column({ nullable: false , default : false })
  accepts_fast_gifts : boolean;
  
  
  @Column({ nullable: true , unique : true })
  national_id_image: string;

  @Column({ nullable: true , unique : true })
  insurance_document: string;

  @Column({ nullable: true , unique : true })
  vehicle_registration_image: string;

}
