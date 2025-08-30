import { IsString } from "class-validator";
import { IsExists } from "src/validators/is_exists/Is-exists.decorator";
import { Lang } from "../entities/lang.entity";

export class CreateLangDto {
  @IsString()
  @IsExists(Lang , "icon")
  icon: string;
  @IsString()
  @IsExists(Lang , "lang")
  lang: string;
  @IsString()
  @IsExists(Lang , "string")
  string: string;
}