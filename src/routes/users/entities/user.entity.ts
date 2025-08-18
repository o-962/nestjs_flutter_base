import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id : number;
  @Column({nullable : true})
  gender : string;
  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;
  @Column({ type: 'date', nullable: true })
  birthdate: Date;
  @Column({ type: 'text', nullable: true })
  bio: string;
}