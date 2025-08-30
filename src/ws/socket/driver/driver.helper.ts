import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryType, DriverStatus, Gender, GiftType, OrderStatus, PreferredGender } from '@src/common/enums';
import { Driver } from '@src/ws/api/drivers/entities/driver.entity';
import { Order } from '@src/ws/api/orders/entities/order.entity';
import { Repository } from 'typeorm';

export interface DriverOrderMatch {
  driver: Driver;
  compatibleOrders: Order[];
  totalPassengers: number;
  totalGifts: number;
  totalCapacityUsed: number;
  utilizationRate: number; // Percentage of capacity used
}

export interface OrderDriverMatch {
  orders: Order[];
  totalPassengers: number;
  totalGifts: number;
  totalCapacityUsed: number;
}

export interface FastGiftMatch {
  [driverId: string]: Order[];
}

@Injectable()
export class DriverOrderMatchingHelper {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * Get all fast gifts matched with eligible drivers
   * Fast gifts are only available for:
   * 1. Drivers who specifically want to handle fast gifts (driver.accepts_fast_gifts = true)
   * 2. Drivers who are already on a trip (driver.status = IN_TRIP)
   * Fast gift radius is fixed at 10km
   */
  async getFastGiftMatches(): Promise<FastGiftMatch> {
    const FAST_GIFT_RADIUS_KM = 10;
    const FAST_GIFT_RADIUS_METERS = FAST_GIFT_RADIUS_KM * 1000;

    try {
      // Get all fast gift orders
      const fastGiftOrders = await this.orderRepo
        .createQueryBuilder('ord')
        .leftJoinAndSelect('ord.gift_details', 'gift')
        .leftJoinAndSelect('ord.user', 'user')
        .where('ord.delivery_type = :giftType')
        .andWhere('ord.order_status = :status')
        .andWhere('ord.pickup_lat IS NOT NULL')
        .andWhere('ord.pickup_lng IS NOT NULL')
        .andWhere('gift.giftType = :fastGiftType')
        .setParameters({
          giftType: DeliveryType.GIFTS,
          status: OrderStatus.PENDING,
          fastGiftType: GiftType.FAST,
        })
        .getMany();

      console.log(`Found ${fastGiftOrders.length} fast gift orders`);

      if (fastGiftOrders.length === 0) {
        return {};
      }

      // Get eligible drivers (those who accept fast gifts OR are currently on a trip)
      const eligibleDrivers = await this.driverRepo
        .createQueryBuilder('driver')
        .where('driver.lat IS NOT NULL')
        .andWhere('driver.lng IS NOT NULL')
        .andWhere('driver.lat != 0')
        .andWhere('driver.lng != 0')
        .andWhere(
          '(driver.accepts_fast_gifts = true OR driver.status = :inTripStatus)'
        )
        .andWhere('driver.status != :offlineStatus') // Exclude offline drivers
        .setParameters({
          inTripStatus: DriverStatus.IN_TRIP,
          offlineStatus: DriverStatus.OFFLINE,
        })
        .getMany();

      console.log(`Found ${eligibleDrivers.length} eligible drivers for fast gifts`);

      const fastGiftMatches: FastGiftMatch = {};

      // Match each driver with nearby fast gifts
      for (const driver of eligibleDrivers) {
        const matchingGifts: Order[] = [];

        for (const giftOrder of fastGiftOrders) {
          // Calculate distance between driver and gift pickup location
          const distance = this.calculateDistance(
            driver.lat,
            driver.lng,
            giftOrder.pickup_lat,
            giftOrder.pickup_lng
          );

          // Check if gift is within fast gift radius (10km)
          if (distance <= FAST_GIFT_RADIUS_KM) {
            // Additional checks for drivers on trip
            if (driver.status === DriverStatus.IN_TRIP) {
              // Check if driver has available capacity for the gift
              const currentCapacityUsed = await this.getCurrentDriverCapacityUsage(driver);
              if (currentCapacityUsed + 1 <= driver.max_seats) {
                matchingGifts.push(giftOrder);
              }
            } else {
              // Driver specifically accepts fast gifts and is available
              matchingGifts.push(giftOrder);
            }
          }
        }

        // Only add driver to results if they have matching gifts
        if (matchingGifts.length > 0) {
          fastGiftMatches[driver.id.toString()] = matchingGifts;
          
          console.log(
            `Driver ${driver.id} (${driver.status}): ${matchingGifts.length} fast gifts within ${FAST_GIFT_RADIUS_KM}km`
          );
        }
      }

      console.log(`Fast gift matching complete: ${Object.keys(fastGiftMatches).length} drivers with matches`);
      return fastGiftMatches;

    } catch (error) {
      console.error('Error in fast gift matching:', error);
      throw error;
    }
  }

  /**
   * Get current capacity usage for a driver (for drivers already on trip)
   */
  private async getCurrentDriverCapacityUsage(driver: Driver): Promise<number> {
    // If driver is not on a trip, return 0
    if (driver.status !== DriverStatus.IN_TRIP) {
      return 0;
    }

    try {
      // Get current active orders for this driver
      const activeOrders = await this.orderRepo
        .createQueryBuilder('ord')
        .leftJoinAndSelect('ord.taxi_details', 'taxi')
        .leftJoinAndSelect('ord.gift_details', 'gift')
        .where('ord.driver_id = :driverId')
        .andWhere('ord.order_status IN (:...activeStatuses)')
        .setParameters({
          driverId: driver.id,
          activeStatuses: [OrderStatus.QUEUE, OrderStatus.DRIVER_EN_ROUTE, OrderStatus.DRIVER_ARRIVED, OrderStatus.IN_PROGRESS]
        })
        .getMany();

      const { totalCapacityUsed } = this.calculateOrderCapacity(activeOrders);
      return totalCapacityUsed;

    } catch (error) {
      console.error(`Error calculating current capacity for driver ${driver.id}:`, error);
      return driver.max_seats; // Assume full capacity on error to be safe
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find drivers that can handle an order (with ride-sharing and gift delivery capability)
   * Returns drivers with all compatible orders they can pick up
   */
  async findDriversForOrder(order: Order): Promise<DriverOrderMatch[]> {
    
    if (!order.pickup_lat || !order.pickup_lng) {
      console.error('Invalid order coordinates:', {
        pickup_lat: order.pickup_lat,
        pickup_lng: order.pickup_lng,
      });
      return [];
    }

    // Use TypeORM query builder to get proper Driver entities
    const driversQB = this.driverRepo
      .createQueryBuilder('driver')
      .addSelect(
        `ST_DistanceSphere(
          ST_MakePoint(driver.lng, driver.lat),
          ST_MakePoint(:orderLng, :orderLat)
        ) / 1000`,
        'distance_km',
      )
      .where('driver.lat IS NOT NULL')
      .andWhere('driver.lng IS NOT NULL')
      .andWhere('driver.lat != 0')
      .andWhere('driver.lng != 0')
      .andWhere('driver.status = :status')
      .andWhere(
        `ST_DistanceSphere(
          ST_MakePoint(driver.lng, driver.lat),
          ST_MakePoint(:orderLng, :orderLat)
        ) <= driver.pick_radius * 1000`
      )
      .andWhere('NOT (:pickupLocation = ANY(driver.excluded_areas))')
      .setParameters({
        orderLng: order.pickup_lng,
        orderLat: order.pickup_lat,
        status: DriverStatus.ONLINE,
        pickupLocation: order.pickup_location,
      })
      .orderBy('distance_km', 'ASC');

    try {
      const drivers = await driversQB.getMany();
      const results: DriverOrderMatch[] = [];

      for (const driver of drivers) {
        const compatibleOrders = await this.findCompatibleOrdersForDriver(driver, order);
        
        if (compatibleOrders.length > 0) {
          const { totalPassengers, totalGifts, totalCapacityUsed } = this.calculateOrderCapacity(compatibleOrders);
          
          // Validate capacity constraints
          const meetsMaxCapacity = totalCapacityUsed <= driver.max_seats;
          const meetsMinCapacity = totalPassengers >= (driver.min_seats || 0);
          
          if (meetsMaxCapacity && meetsMinCapacity) {
            const utilizationRate = (totalCapacityUsed / driver.max_seats) * 100;

            results.push({
              driver,
              compatibleOrders,
              totalPassengers,
              totalGifts,
              totalCapacityUsed,
              utilizationRate,
            });
          } else {
            console.log(`Driver ${driver.id} capacity validation failed:`, {
              totalPassengers,
              totalGifts,
              totalCapacityUsed,
              maxSeats: driver.max_seats,
              minSeats: driver.min_seats || 0,
              meetsMaxCapacity,
              meetsMinCapacity
            });
          }
        }
      }

      console.log(`Found ${results.length} driver-order combinations for order ${order.id}`);
      return results.sort((a, b) => b.utilizationRate - a.utilizationRate); // Best utilization first

    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  /**
   * Find orders that match a driver (including gifts)
   * Returns orders that the driver can pick up individually or combined
   */
  async findOrdersForDriver(driver: Driver): Promise<OrderDriverMatch> {
    const excluded = driver.excluded_areas || [];
    const radiusMeters = driver.pick_radius * 1000;

    if (!driver.lat || !driver.lng) {
      console.error('Invalid driver coordinates:', {
        driverLat: driver.lat,
        driverLng: driver.lng,
      });
      return { orders: [], totalPassengers: 0, totalGifts: 0, totalCapacityUsed: 0 };
    }

    // Build preference conditions for taxi orders only
    const { driverPreferenceCondition, passengerPreferenceCondition } = 
      this.buildPreferenceConditions(driver);

    // Build excluded areas condition
    const excludedCondition = excluded.length > 0 ? 
      `"ord"."pickup_location" NOT IN (${excluded.map((_, index) => `:excluded${index}`).join(', ')})` : '1=1';

    // Build minimum seats condition (only for taxi orders)
    const minSeatsCondition = driver.min_seats > 0 ? 
      `(ord.delivery_type != :taxiType OR (taxi.male + taxi.female) >= :minSeats)` : '1=1';

    // Create parameters object
    const parameters: any = {
      driverLng: driver.lng,
      driverLat: driver.lat,
      radius: radiusMeters,
      status: OrderStatus.PENDING,
      any: PreferredGender.ANY,
      male: PreferredGender.MALE,
      female: PreferredGender.FEMALE,
      driverWantsMale: PreferredGender.MALE,
      driverWantsFemale: PreferredGender.FEMALE,
      taxiType: DeliveryType.TAXI,
      giftType: DeliveryType.GIFTS,
      maxSeats: driver.max_seats,
    };

    // Add excluded area parameters
    excluded.forEach((area, index) => {
      parameters[`excluded${index}`] = area;
    });

    // Add min seats parameter if needed
    if (driver.min_seats > 0) {
      parameters.minSeats = driver.min_seats;
    }

    const qb = this.orderRepo
      .createQueryBuilder('ord')
      .leftJoinAndSelect('ord.taxi_details', 'taxi')
      .leftJoinAndSelect('ord.gift_details', 'gift')
      .leftJoinAndSelect('ord.user', 'user')
      .addSelect(
        `ST_DistanceSphere(
          ST_MakePoint(:driverLng, :driverLat),
          ST_MakePoint("ord"."pickup_lng", "ord"."pickup_lat")
        ) / 1000`,
        'distance_km',
      )
      .where(`
        "ord"."pickup_lat" IS NOT NULL 
        AND "ord"."pickup_lng" IS NOT NULL 
        AND "ord"."order_status" = :status
        AND ST_DistanceSphere(
          ST_MakePoint(:driverLng, :driverLat),
          ST_MakePoint("ord"."pickup_lng", "ord"."pickup_lat")
        ) <= :radius
        AND (
          -- Gift orders (no preference rules, just basic validation)
          ord.delivery_type = :giftType
          OR 
          -- Taxi orders (with all preference rules)
          (ord.delivery_type = :taxiType AND ${driverPreferenceCondition} AND ${passengerPreferenceCondition} AND (taxi.male + taxi.female) <= :maxSeats AND ${minSeatsCondition})
        )
        AND ${excludedCondition}
      `, parameters)
      .orderBy('distance_km', 'ASC');

    try {
      const availableOrders = await qb.getMany();
      const optimizedOrders = this.optimizeOrderCombination(availableOrders, driver);
      const { totalPassengers, totalGifts, totalCapacityUsed } = this.calculateOrderCapacity(optimizedOrders);

      console.log(`Driver ${driver.id}: Found ${optimizedOrders.length} orders with ${totalPassengers} passengers + ${totalGifts} gifts = ${totalCapacityUsed}/${driver.max_seats} capacity`);

      return {
        orders: optimizedOrders,
        totalPassengers,
        totalGifts,
        totalCapacityUsed,
      };

    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  /**
   * Get all fast gifts and match them with eligible drivers
   * Returns a map where driver ID is the key and fast gifts array is the value
   * Fast gift radius is fixed at 10km
   */
  async getAllFastGiftMatches(): Promise<FastGiftMatch> {
    const FAST_GIFT_RADIUS_KM = 10;
    const FAST_GIFT_RADIUS_METERS = FAST_GIFT_RADIUS_KM * 1000;

    try {
      // Get all fast gift orders
      const fastGiftOrders = await this.orderRepo
        .createQueryBuilder('ord')
        .leftJoinAndSelect('ord.gift_details', 'gift')
        .leftJoinAndSelect('ord.user', 'user')
        .where('ord.delivery_type = :giftType')
        .andWhere('ord.order_status = :status')
        .andWhere('ord.pickup_lat IS NOT NULL')
        .andWhere('ord.pickup_lng IS NOT NULL')
        .andWhere('gift.giftType = :fastGiftType') // Only fast gifts
        .setParameters({
          giftType: DeliveryType.GIFTS,
          status: OrderStatus.PENDING,
          fastGiftType: GiftType.FAST,
        })
        .getMany();

      console.log(`Found ${fastGiftOrders.length} fast gift orders`);

      if (fastGiftOrders.length === 0) {
        return {};
      }

      // Get eligible drivers: those who accept fast gifts OR are currently on a trip
      const eligibleDrivers = await this.driverRepo
        .createQueryBuilder('driver')
        .where('driver.lat IS NOT NULL')
        .andWhere('driver.lng IS NOT NULL')
        .andWhere('driver.lat != 0')
        .andWhere('driver.lng != 0')
        .andWhere(
          '(driver.accepts_fast_gifts = true OR driver.status = :inTripStatus)'
        )
        .andWhere('driver.status != :offlineStatus') // Exclude offline drivers
        .setParameters({
          inTripStatus: DriverStatus.IN_TRIP,
          offlineStatus: DriverStatus.OFFLINE,
        })
        .getMany();

      console.log(`Found ${eligibleDrivers.length} eligible drivers for fast gifts`);

      const fastGiftMatches: FastGiftMatch = {};

      // Match each driver with nearby fast gifts
      for (const driver of eligibleDrivers) {
        const matchingGifts: Order[] = [];

        for (const giftOrder of fastGiftOrders) {
          // Calculate distance between driver and gift pickup location
          const distance = this.calculateDistance(
            driver.lat,
            driver.lng,
            giftOrder.pickup_lat,
            giftOrder.pickup_lng
          );

          // Check if gift is within fast gift radius (10km)
          if (distance <= FAST_GIFT_RADIUS_KM) {
            // Check excluded areas
            const excluded = driver.excluded_areas || [];
            if (excluded.includes(giftOrder.pickup_location)) {
              continue; // Skip this gift if pickup location is excluded
            }

            // Additional checks for drivers on trip
            if (driver.status === DriverStatus.IN_TRIP) {
              // Check if driver has available capacity for the gift
              const currentCapacityUsed = await this.getCurrentDriverCapacityUsage(driver);
              if (currentCapacityUsed + 1 <= driver.max_seats) {
                matchingGifts.push(giftOrder);
              }
            } else {
              // Driver specifically accepts fast gifts and is available
              matchingGifts.push(giftOrder);
            }
          }
        }

        // Sort gifts by distance (closest first)
        matchingGifts.sort((a, b) => {
          const distanceA = this.calculateDistance(driver.lat, driver.lng, a.pickup_lat, a.pickup_lng);
          const distanceB = this.calculateDistance(driver.lat, driver.lng, b.pickup_lat, b.pickup_lng);
          return distanceA - distanceB;
        });

        // Only add driver to results if they have matching gifts
        if (matchingGifts.length > 0) {
          fastGiftMatches[driver.id.toString()] = matchingGifts;
          
          console.log(
            `Driver ${driver.id} (${driver.status === DriverStatus.IN_TRIP ? 'ON_TRIP' : 'ACCEPTS_FAST_GIFTS'}): ${matchingGifts.length} fast gifts within ${FAST_GIFT_RADIUS_KM}km`
          );
        }
      }

      console.log(`Fast gift matching complete: ${Object.keys(fastGiftMatches).length} drivers with matches`);
      return fastGiftMatches;

    } catch (error) {
      console.error('Error in getAllFastGiftMatches:', error);
      throw error;
    }
  }

  /**
   * Find all compatible orders for a specific driver (including gifts and ride-sharing)
   */
  private async findCompatibleOrdersForDriver(driver: Driver, primaryOrder: Order): Promise<Order[]> {
    const excluded = driver.excluded_areas || [];
    
    const ordersQB = this.orderRepo
      .createQueryBuilder('ord')
      .leftJoinAndSelect('ord.taxi_details', 'taxi')
      .leftJoinAndSelect('ord.gift_details', 'gift')
      .leftJoinAndSelect('ord.user', 'user')
      .addSelect(
        `ST_DistanceSphere(
          ST_MakePoint(:driverLng, :driverLat),
          ST_MakePoint(ord.pickup_lng, ord.pickup_lat)
        ) / 1000`,
        'distance_km',
      )
      .where('ord.pickup_lat IS NOT NULL')
      .andWhere('ord.pickup_lng IS NOT NULL')
      .andWhere('ord.order_status = :status')
      .andWhere(
        `ST_DistanceSphere(
          ST_MakePoint(:driverLng, :driverLat),
          ST_MakePoint(ord.pickup_lng, ord.pickup_lat)
        ) <= :radius * 1000`
      )
      .setParameters({
        driverLng: driver.lng,
        driverLat: driver.lat,
        status: OrderStatus.PENDING,
        radius: driver.pick_radius,
      })
      .orderBy('distance_km', 'ASC');

    // Add excluded areas condition if any
    if (excluded.length > 0) {
      ordersQB.andWhere('ord.pickup_location NOT IN (:...excluded)', { excluded });
    }

    const availableOrders = await ordersQB.getMany();
    return this.findOptimalOrderCombination(availableOrders, driver, primaryOrder);
  }

  /**
   * Build preference conditions for driver-order matching (taxi orders only)
   */
  private buildPreferenceConditions(driver: Driver) {
    // Driver preference condition
    let driverPreferenceCondition = '';
    if (driver.preferred_passengers === PreferredGender.MALE) {
      driverPreferenceCondition = `(taxi.passengersGender = :driverWantsMale OR taxi.passengersGender IS NULL)`;
    } else if (driver.preferred_passengers === PreferredGender.FEMALE) {
      driverPreferenceCondition = `(taxi.passengersGender = :driverWantsFemale OR taxi.passengersGender IS NULL)`;
    } else {
      driverPreferenceCondition = '1=1';
    }

    // Passenger preference condition
    let passengerPreferenceCondition = '';
    if (driver.gender === Gender.MALE) {
      passengerPreferenceCondition = `(taxi.driverGender = :any OR taxi.driverGender = :male OR taxi.driverGender IS NULL)`;
    } else if (driver.gender === Gender.FEMALE) {
      passengerPreferenceCondition = `(taxi.driverGender = :any OR taxi.driverGender = :female OR taxi.driverGender IS NULL)`;
    } else {
      passengerPreferenceCondition = '1=1';
    }

    return { driverPreferenceCondition, passengerPreferenceCondition };
  }

  /**
   * Find optimal combination of orders using greedy algorithm (supports gifts + passengers)
   */
  private findOptimalOrderCombination(availableOrders: Order[], driver: Driver, primaryOrder?: Order): Order[] {
    const maxCapacity = driver.max_seats;
    const minCapacity = driver.min_seats || 0;
    
    // Filter orders that match driver preferences (gifts are always compatible)
    const validOrders = availableOrders.filter(ord => 
      this.isOrderCompatibleWithDriver(ord, driver)
    );

    // Ensure primary order is included if provided and compatible
    if (primaryOrder) {
      const primaryOrderInList = validOrders.find(ord => ord.id === primaryOrder.id);
      if (!primaryOrderInList && this.isOrderCompatibleWithDriver(primaryOrder, driver)) {
        // Add primary order to the beginning of the list
        validOrders.unshift(primaryOrder);
      }
    }

    return this.optimizeOrderCombination(validOrders, driver);
  }

  /**
   * Optimize order combination for maximum efficiency (supports mixed passengers + gifts)
   */
  private optimizeOrderCombination(orders: any[], driver: any): Order[] {
    const maxCapacity = driver.max_seats;
    const minPassengerCapacity = driver.min_seats || 0;

    // Sort by distance and capacity efficiency
    orders.sort((a, b) => {
      const aCapacity = this.getOrderCapacityUsage(a);
      const bCapacity = this.getOrderCapacityUsage(b);
      const aEfficiency = aCapacity / Math.max(a.distance_km, 0.1);
      const bEfficiency = bCapacity / Math.max(b.distance_km, 0.1);
      
      return bEfficiency - aEfficiency; // Higher efficiency first
    });

    // Greedy selection algorithm
    const selectedOrders: any = [];
    let currentCapacityUsed = 0;
    let currentPassengers = 0;

    for (const order of orders) {
      const orderCapacityUsage = this.getOrderCapacityUsage(order);
      const orderPassengers = this.getOrderPassengerCount(order);
      
      if (currentCapacityUsed + orderCapacityUsage <= maxCapacity) {
        selectedOrders.push(order);
        currentCapacityUsed += orderCapacityUsage;
        currentPassengers += orderPassengers;
        
        // Stop if we've reached optimal capacity utilization
        if (currentCapacityUsed >= maxCapacity * 0.9) {
          break;
        }
      }
    }

    // Return only if minimum passenger capacity is met
    return currentPassengers >= minPassengerCapacity ? selectedOrders : [];
  }

  /**
   * Check if an order is compatible with a driver's preferences
   */
  private isOrderCompatibleWithDriver(order: Order, driver: Driver): boolean {
    // Gift orders are always compatible (no preference rules)
    if (order.delivery_type === DeliveryType.GIFTS) {
      return true;
    }

    // Non-taxi orders are always compatible
    if (order.delivery_type !== DeliveryType.TAXI) {
      return true;
    }

    // Get taxi details from the order entity
    const taxi = order.taxi_details;
    if (!taxi) {
      return true; // No taxi details available, assume compatible
    }

    // Check driver's passenger preference
    if (driver.preferred_passengers && driver.preferred_passengers !== PreferredGender.ANY) {
      if (taxi.passengersGender && taxi.passengersGender !== PreferredGender.ANY) {
        if (driver.preferred_passengers !== taxi.passengersGender) {
          return false;
        }
      }
    }

    // Check passenger's driver preference
    if (taxi.driverGender && taxi.driverGender !== PreferredGender.ANY) {
      if (taxi.driverGender === PreferredGender.MALE && driver.gender !== Gender.MALE) {
        return false;
      }
      if (taxi.driverGender === PreferredGender.FEMALE && driver.gender !== Gender.FEMALE) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get passenger count for an order (only for taxi orders)
   */
  private getOrderPassengerCount(order: Order): number {
    // For taxi orders, get passenger count from taxi_details
    if (order.delivery_type === DeliveryType.TAXI && order.taxi_details) {
      return (order.taxi_details.male || 0) + (order.taxi_details.female || 0);
    }
    return 0; // Gifts have no passengers
  }

  /**
   * Get gift count for an order (only for gift orders)
   */
  private getOrderGiftCount(order: Order): number {
    // For gift orders, each order represents 1 gift
    if (order.delivery_type === DeliveryType.GIFTS) {
      return 1;
    }
    return 0; // Non-gift orders have no gifts
  }

  /**
   * Get total capacity usage for an order (passengers + gifts use same capacity)
   */
  private getOrderCapacityUsage(order: Order): number {
    if (order.delivery_type === DeliveryType.TAXI && order.taxi_details) {
      return (order.taxi_details.male || 0) + (order.taxi_details.female || 0);
    }
    if (order.delivery_type === DeliveryType.GIFTS) {
      return 1; // Each gift takes 1 capacity slot
    }
    return 1; // Other orders count as 1 capacity
  }

  /**
   * Calculate total capacity usage for a list of orders
   */
  private calculateOrderCapacity(orders: Order[]): {
    totalPassengers: number;
    totalGifts: number;
    totalCapacityUsed: number;
  } {
    const totalPassengers = orders.reduce((sum, order) => sum + this.getOrderPassengerCount(order), 0);
    const totalGifts = orders.reduce((sum, order) => sum + this.getOrderGiftCount(order), 0);
    const totalCapacityUsed = orders.reduce((sum, order) => sum + this.getOrderCapacityUsage(order), 0);

    return {
      totalPassengers,
      totalGifts,
      totalCapacityUsed,
    };
  }

  /**
   * Calculate total passengers for a list of orders (legacy method for backward compatibility)
   */
  private calculateTotalPassengers(orders: Order[]): number {
    return this.calculateOrderCapacity(orders).totalPassengers;
  }

  /**
   * Get matching statistics for debugging (enhanced with gift support)
   */
  async getMatchingStats(driver: Driver, order: Order): Promise<{
    nearbyDrivers: number;
    nearbyOrders: number;
    compatibleOrders: number;
    preferenceMatches: number;
    giftOrders: number;
    taxiOrders: number;
  }> {
    try {
      const driverMatches = await this.findDriversForOrder(order);
      const orderMatches = await this.findOrdersForDriver(driver);

      const giftOrders = orderMatches.orders.filter(ord => ord.delivery_type === DeliveryType.GIFTS).length;
      const taxiOrders = orderMatches.orders.filter(ord => ord.delivery_type === DeliveryType.TAXI).length;

      return {
        nearbyDrivers: driverMatches.length,
        nearbyOrders: orderMatches.orders.length,
        compatibleOrders: orderMatches.orders.length,
        preferenceMatches: driverMatches.filter(match => match.compatibleOrders.length > 1).length,
        giftOrders,
        taxiOrders,
      };
    } catch (error) {
      console.error('Error getting matching stats:', error);
      return { 
        nearbyDrivers: 0, 
        nearbyOrders: 0, 
        compatibleOrders: 0, 
        preferenceMatches: 0, 
        giftOrders: 0, 
        taxiOrders: 0 
      };
    }
  }

  /**
   * Get fast gift matching statistics for debugging
   */
  async getFastGiftMatchingStats(): Promise<{
    totalFastGifts: number;
    eligibleDrivers: number;
    driversWithMatches: number;
    averageGiftsPerDriver: number;
    totalMatches: number;
  }> {
    try {
      const fastGiftMatches = await this.getAllFastGiftMatches();
      const driversWithMatches = Object.keys(fastGiftMatches).length;
      const totalMatches = Object.values(fastGiftMatches).reduce((sum, gifts) => sum + gifts.length, 0);
      
      // Get total fast gifts
      const totalFastGifts = await this.orderRepo
        .createQueryBuilder('ord')
        .leftJoin('ord.gift_details', 'gift')
        .where('ord.delivery_type = :giftType')
        .andWhere('ord.order_status = :status')
        .andWhere('gift.giftType = :fastGiftType')
        .setParameters({
          giftType: DeliveryType.GIFTS,
          status: OrderStatus.PENDING,
          fastGiftType: GiftType.FAST,
        })
        .getCount();

      // Get eligible drivers count
      const eligibleDrivers = await this.driverRepo
        .createQueryBuilder('driver')
        .where('driver.lat IS NOT NULL')
        .andWhere('driver.lng IS NOT NULL')
        .andWhere('driver.lat != 0')
        .andWhere('driver.lng != 0')
        .andWhere(
          '(driver.accepts_fast_gifts = true OR driver.status = :onTripStatus)'
        )
        .andWhere('driver.status != :offlineStatus')
        .setParameters({
          onTripStatus: DriverStatus.IN_TRIP,
          offlineStatus: DriverStatus.OFFLINE,
        })
        .getCount();

      const averageGiftsPerDriver = driversWithMatches > 0 ? totalMatches / driversWithMatches : 0;

      return {
        totalFastGifts,
        eligibleDrivers,
        driversWithMatches,
        averageGiftsPerDriver: Math.round(averageGiftsPerDriver * 100) / 100,
        totalMatches,
      };
    } catch (error) {
      console.error('Error getting fast gift matching stats:', error);
      return {
        totalFastGifts: 0,
        eligibleDrivers: 0,
        driversWithMatches: 0,
        averageGiftsPerDriver: 0,
        totalMatches: 0,
      };
    }
  }

  /**
   * Get fast gifts for a specific driver
   */
  async getFastGiftsForDriver(driverId: string): Promise<Order[]> {
    const fastGiftMatches = await this.getAllFastGiftMatches();
    return fastGiftMatches[driverId] || [];
  }

  /**
   * Check if a driver is eligible for fast gifts
   */
  async isDriverEligibleForFastGifts(driver: Driver): Promise<boolean> {
    // Driver must have valid coordinates
    if (!driver.lat || !driver.lng || driver.lat === 0 || driver.lng === 0) {
      return false;
    }

    // Driver must not be offline
    if (driver.status === DriverStatus.OFFLINE) {
      return false;
    }

    // Driver is eligible if they accept fast gifts OR are currently on a trip
    return driver.accepts_fast_gifts === true || driver.status === DriverStatus.IN_TRIP;
  }
}