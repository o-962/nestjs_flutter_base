import { IsEmail, IsMobilePhone, IsOptional, IsString, isString, ValidateIf } from 'class-validator';

export class ForgetPassword {
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsMobilePhone('ar-JO')
  @IsOptional()
  phone_number?:string;
  @IsString()
  @IsOptional()
  user_name?:string;
  @ValidateIf(o => !o.email && !o.phone_number && !o.user_name || o.email && o.phone_number || o.email && o.user_name || o.user_name && o.phone_number)
  @IsString({ message: 'Either email or phoneNumber or mobile number must be provided.' })
  error?:string;
}