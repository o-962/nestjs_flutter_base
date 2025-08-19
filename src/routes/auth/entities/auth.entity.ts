import { BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("auth")
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column()
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
