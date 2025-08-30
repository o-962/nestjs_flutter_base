import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Config {
  @PrimaryColumn()
  id: number = 1;

  @Column({ default: process.env.OTP_LENGTH })
  otp_length: number;
  @Column({ default: process.env.OTP_EVERY })
  otp_every: number;
  @Column({ default: process.env.OTP_TIMES })
  otp_times: number;

  @BeforeInsert()
  setDefaults() {
    this.otp_length = this.otp_length ?? parseInt(process.env.OTP_LENGTH || '6', 10);
    this.otp_every = this.otp_every ?? parseInt(process.env.OTP_EVERY || '60', 10);
    this.otp_times = this.otp_times ?? parseInt(process.env.OTP_TIMES || '3', 10);
  }
}
