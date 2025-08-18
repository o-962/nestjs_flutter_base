import { Permission } from "@routes/permissions/entities/permission.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id : number;
  @Column({unique : true})
  name : string;
  
  @ManyToMany(()=>Permission , {cascade : true , eager : true})
  @JoinTable({
    name : 'role_permissions',
    joinColumn : {name : 'role_id'},
    inverseJoinColumn : {name : 'permission_id'}
  })
  permissions : Permission[]
}