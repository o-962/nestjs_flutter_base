import { Driver } from "@src/ws/api/drivers/entities/driver.entity";
import { Order } from "@src/ws/api/orders/entities/order.entity";

export interface DriverOrderMatch {
  driver: Driver;
  compatibleOrders: Order[];
  totalPassengers: number;
  utilizationRate: number; // Percentage of capacity used
}

export interface OrderDriverMatch {
  orders: Order[];
  totalPassengers: number;
}