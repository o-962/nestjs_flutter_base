import { sharedData } from '@src/common/data';
import { DeliveryType, Gender, GiftType, PreferredGender } from '@src/common/enums';
import { CreateOrderDto } from '@src/ws/api/orders/dto/create-order.dto';
import { readFileSync } from 'fs';
import { join } from 'path';

export function calcCosts(order: CreateOrderDto): number | null {
  const costs = sharedData.costs;

  const pickPoints: LatLng = { lat: order.pickup_lat, lng: order.pickup_lng };
  const dropPoints: LatLng = { lat: order.dropoff_lat, lng: order.dropoff_lng };

  const pickup = getCityFromPoint(pickPoints);
  const dropoff = getCityFromPoint(dropPoints);

  if (!(pickup && dropoff)) {
    return null;
  }

  if (!costs[pickup] || !costs[pickup][dropoff]) {
    return 0;
  }
  const routeCosts = costs[pickup][dropoff];
  let totalCost = 0;
  if (order.delivery_type === DeliveryType.GIFTS) {
    if (order.gift_type === GiftType.FAST) {
      totalCost += routeCosts.gift_fast;
    } else {
      totalCost += routeCosts.gift_normal;
    }
    return totalCost;
  }
  if (order.driver_gender === PreferredGender.MALE) {
    totalCost += routeCosts.driver_male;
  } else if (order.driver_gender === PreferredGender.FEMALE) {
    totalCost += routeCosts.driver_female;
  }

  totalCost += (order.male ?? 0) * routeCosts.male;
  totalCost += (order.female ?? 0) * routeCosts.female;

  return totalCost;
}

export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (polygon.length === 0) return false;
  let intersectCount = 0;
  const x = point.lng;
  const y = point.lat;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      intersectCount++;
    }
  }

  return intersectCount % 2 === 1;
}

export function getCityFromPoint(point: LatLng): string | null {
  const filePath = join(process.cwd(), 'uploads', 'map.json');
  const fileContent = readFileSync(filePath, 'utf8');
  const map: Record<string, [number, number][]> = JSON.parse(fileContent);

  for (const [city, coords] of Object.entries(map)) {
    const polygon: LatLng[] = (coords as [number, number][]).map(
      ([lng, lat]) => ({ lat, lng }),
    );
    if (isPointInPolygon(point, polygon)) {
      return city;
    }
  }

  return null;
}

export function validateOrder(order: CreateOrderDto): CreateOrderDto {
  
  const { male , female } = order;
  
  if (female > 0 && male == 0) {
    return order;
  }
  if (male > 0 && female > 0) {
    order.passengers_gender = PreferredGender.ANY;
    order.driver_gender = PreferredGender.ANY;
  }
  if (male > 0 && female == 0) {
    order.passengers_gender = PreferredGender.MALE;
    order.driver_gender = PreferredGender.MALE;
  }
  return order;
}
