import { IsString } from "class-validator";
import { ManyToMany, PrimaryGeneratedColumn } from "typeorm";

export class CreateRoleDto {
  @PrimaryGeneratedColumn()
  id : number;
  @IsString()
  name : string;
  
}
