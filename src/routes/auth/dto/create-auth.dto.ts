import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { IsExists } from 'src/validators/is_exists/Is-exists.decorator';
import { Auth } from '../entities/auth.entity';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsMobilePhone()
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
