import { Translation } from "@src/routes/translations/entities/translation.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Lang {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  lang: string;

  @Column({ unique: true })
  icon: string;



  @OneToMany(() => Translation, translation => translation.lang , {cascade : true})
  translations: Translation[];
}