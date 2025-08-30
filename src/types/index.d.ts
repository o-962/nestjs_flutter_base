import { Response } from "@types/api.type";

export {};

declare global {

  type BaseResponseOption = Response;
  
  
  type LatLng = {
    lat: number;
    lng: number;
  }
  
}