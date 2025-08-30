import { DriverStatus, Gender, PreferredGender } from "@src/common/enums";
import { IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsPositive, IsString, IsUrl, Max, Min } from "class-validator";
import { CreateAuthDto } from "../../auth/dto/create-auth.dto";
import { IsExists } from "@src/validators/is_exists/Is-exists.decorator";
import { Driver } from "../entities/driver.entity";

export class CreateDriverDto extends CreateAuthDto {
  /** Location */
  @IsNumber({}, { message: "Latitude must be a number" })
  lat: number;

  @IsNumber({}, { message: "Longitude must be a number" })
  lng: number;



  @IsEnum(PreferredGender, { message: "Invalid preferred passenger gender" })
  preferred_passengers: PreferredGender;

  @IsExists(Driver, 'driver_phone_number')
  @IsPhoneNumber("JO", { message: "Invalid phone number" }) // replace "JO" with your country code
  driver_phone_number: string;

  /** Status & Rating */
  @IsEnum(DriverStatus, { message: "Invalid driver status" })
  @IsOptional()
  status?: DriverStatus;

  @IsNumber({}, { message: "Rating must be a number" })
  @Min(1, { message: "Minimum rating is 1" })
  @IsOptional()
  rating?: number;

  @IsNumber({}, { message: "Total trips must be a number" })
  @Min(0, { message: "Total trips cannot be negative" })
  @IsOptional()
  total_trips?: number;

  @IsNumber({}, { message: "Balance must be a number" })
  @Min(0, { message: "Balance cannot be negative" })
  @IsOptional()
  balance?: number;

  /** Seats */
  @IsNumber({}, { message: "Car seats must be a number" })
  @IsPositive({ message: "Car seats must be positive" })
  car_seats: number;

  @IsNumber({}, { message: "Max seats must be a number" })
  @IsPositive({ message: "Max seats must be positive" })
  max_seats: number;

  @IsNumber({}, { message: "Min seats must be a number" })
  @IsPositive({ message: "Min seats must be positive" })
  min_seats: number;

  @IsNumber({},{ message: "ride range is required" })
  @IsPositive({ message: "ride range should be positive" })
  pick_radius : number;

  /** Documents */
  @IsString()
  @IsOptional()
  @IsExists(Driver, 'driver_license_number')
  driver_license_number?: string;
  
  @IsExists(Driver, 'driver_license_image')
  @IsUrl({}, { message: "Driver license image must be a valid URL" })
  @IsOptional()
  driver_license_image?: string;
  
  @IsExists(Driver, 'national_id_image')
  @IsUrl({}, { message: "National ID image must be a valid URL" })
  @IsOptional()
  national_id_image?: string;
  
  @IsExists(Driver, 'insurance_document')
  @IsUrl({}, { message: "Insurance document must be a valid URL" })
  @IsOptional()
  insurance_document?: string;
  
  @IsUrl({}, { message: "Vehicle registration image must be a valid URL" })
  @IsOptional()
  @IsExists(Driver, 'vehicle_registration_image')
  vehicle_registration_image?: string;

  
}