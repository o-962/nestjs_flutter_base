import { DeliveryType, PreferredGender , GiftType } from '@src/common/enums';
import { IsEnum, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateOrderDto {
  // Main Info (required for all)
  @IsEnum(DeliveryType)
  delivery_type: DeliveryType;

  @IsString()
  pickup_location: string;

  @IsString()
  dropoff_location: string;

  @IsNumber()
  pickup_lat: number;

  @IsNumber()
  pickup_lng: number;

  @IsNumber()
  dropoff_lat: number;

  @IsNumber()
  dropoff_lng: number;
  
  
  @ValidateIf(o => o.delivery_type === DeliveryType.TAXI)
  @IsEnum(PreferredGender)
  driver_gender : PreferredGender;

  @ValidateIf(o => o.delivery_type === DeliveryType.TAXI)
  @IsEnum(PreferredGender)
  passengers_gender : PreferredGender;

  @ValidateIf(o => o.delivery_type === DeliveryType.TAXI)
  @IsNumber()
  @Min(0)
  male : number;

  @ValidateIf(o => o.delivery_type === DeliveryType.TAXI)
  @IsNumber()
  @Min(0)
  female : number;

  // Gift-specific fields (only required if deliveryType === gifts)
  @ValidateIf(o => o.delivery_type === DeliveryType.GIFTS)
  @IsEnum(GiftType)
  gift_type : GiftType;

  // Optional notes for any order
  @IsOptional()
  @IsString()
  notes : string;

  @IsOptional()
  @IsString()
  discount_code?: string;
  
}