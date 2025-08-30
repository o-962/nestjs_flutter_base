import { Gender } from "@src/common/enums";
import { IsOptional, IsDateString, IsString, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsOptional()
  gender?: Gender;

  @IsDateString({}, { message: "last_login must be a valid timestamp" })
  @IsOptional()
  last_login?: Date;

  @IsDateString({}, { message: "birthdate must be a valid date" })
  @IsOptional()
  birthdate?: Date;

  @IsString({ message: "bio must be a string" })
  @MaxLength(500, { message: "bio can have maximum 500 characters" })
  @IsOptional()
  bio?: string;
}
