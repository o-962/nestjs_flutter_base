import { BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Role } from "../../roles/entities/role.entity";
import { Driver } from "../../drivers/entities/driver.entity";

@Entity("auth")
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({unique : true})
  user_name: string;

  @Column()
  password: string;



  @Column({ nullable: true })
  otp: string;
  @Column({ type: 'timestamp', nullable: true })
  otp_sent_at: Date;
  @Column({type : "numeric" , nullable : true , default : 0})
  time_sent : number;
  @BeforeUpdate()
  updateOtpSentAt() {
    if (this.otp) {
      this.otp_sent_at = new Date();
      this.time_sent++
    }
  }
  @OneToOne(()=> User , {cascade : true , eager : true})
  @JoinColumn()
  user?: User;
  
  @OneToOne(()=>Driver , {cascade : true , eager : true , onDelete : 'CASCADE'})
  @JoinColumn()
  driver?: Driver;

  @ManyToOne(()=> Role , {eager : true})
  @JoinColumn()
  role : Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
