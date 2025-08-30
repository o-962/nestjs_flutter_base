import {
  IsEmail,
  IsEnum,
  isEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsExists } from 'src/validators/is_exists/Is-exists.decorator';
import { Auth } from '../entities/auth.entity';
import { Gender } from '@src/common/enums';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class CreateAuthDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsMobilePhone('ar-JO')
  @IsExists(Auth, 'phone_number')
  phone_number: string;

  @IsEmail()
  @IsExists(Auth, 'email')
  email: string;


  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsExists(Auth, 'user_name')
  user_name: string;
}
