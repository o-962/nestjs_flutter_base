import { Lang } from "@src/routes/langs/entities/lang.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(['key', 'lang'], { unique: true })
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => Lang, lang => lang.translations)
  lang: Lang;
}