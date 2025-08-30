export interface RiderDriverModel {
  name: string;
  gender: string;
  rating: number;
  driver_phone_number: string;
  driver_other_phone_number: string;
  driver_license_number : string;
  lat: number;
  lng: number;
  car_seats: number;
  driver_image: string;
  vehicle_image: string;
}

export class RiderDriver implements RiderDriverModel {
  name: string;
  gender: string;
  rating: number;
  driver_phone_number: string;
  driver_other_phone_number: string;
  lat: number;
  lng: number;
  driver_license_number : string;
  car_seats: number;
  driver_image: string;
  vehicle_image: string;

  constructor(data: RiderDriverModel) {
    this.name = data.name;
    this.gender = data.gender;
    this.rating = data.rating;
    this.driver_phone_number = data.driver_phone_number;
    this.driver_other_phone_number = data.driver_other_phone_number;
    this.lat = data.lat;
    this.lng = data.lng;
    this.driver_license_number = data.driver_license_number;
    this.car_seats = data.car_seats;
    this.driver_image = data.driver_image;
    this.vehicle_image = data.vehicle_image;
  }

  static fromJson(json: any): RiderDriver {
    return new RiderDriver({
      name: json.name,
      gender: json.gender,
      rating: json.rating,
      driver_phone_number: json.driver_phone_number,
      driver_other_phone_number: json.driver_other_phone_number,
      lat: json.lat,
      lng: json.lng,
      driver_license_number: json.driver_license_number,

      car_seats: json.car_seats,
      driver_image: json.driver_image,
      vehicle_image: json.vehicle_image,
    });
  }

  toJson(): RiderDriverModel {
    return {
      name: this.name,
      gender: this.gender,
      rating: this.rating,
      driver_phone_number: this.driver_phone_number,
      driver_other_phone_number: this.driver_other_phone_number,
      lat: this.lat,
      lng: this.lng,
      driver_license_number: this.driver_license_number,
      car_seats: this.car_seats,
      driver_image: this.driver_image,
      vehicle_image: this.vehicle_image,
    };
  }
}
