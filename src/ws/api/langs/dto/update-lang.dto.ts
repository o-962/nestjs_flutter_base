import { IsOptional, IsString } from 'class-validator';
import { AtLeastOne } from 'src/validators/at_least_one/at-least-one.decorator';
import { IsNotExists } from 'src/validators/not_is_exists/is-not-exists.decorator';
import { Lang } from '../entities/lang.entity';

export class UpdateLangDto {
  @IsOptional()
  @IsString()
  @IsNotExists(Lang , "icon")
  icon?: string;
  @IsOptional()
  @IsString()
  @IsNotExists(Lang , "lang")
  lang?: string;
  @IsOptional()
  @IsString()
  @IsNotExists(Lang , "string")
  string?: string;
  @AtLeastOne(['icon', 'lang', 'string'], { message: 'At least one field (icon, lang, or string) must be provided for update' })
  error? : null;
}