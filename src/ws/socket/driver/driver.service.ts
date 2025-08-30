import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '@routes/auth/entities/auth.entity';
import { OrderStatus } from '@src/common/enums';
import { ApiResponse } from '@src/models/api.model';
import { SocketState } from '@src/services/socket.state';
import { OrderDriverMatch } from '@src/types/driver.type';
import { Driver } from '@src/ws/api/drivers/entities/driver.entity';
import { Order } from '@src/ws/api/orders/entities/order.entity';
import { In, Not, Repository } from 'typeorm';
import { DriverOrderMatchingHelper } from './driver.helper';
import { timeInterval } from 'rxjs';

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly socketState: SocketState,
    private readonly driverHelper: DriverOrderMatchingHelper,
  ) {}

  async initialize(auth: Auth) {
    if (auth.driver) {
      const currentOrders = await this.orderRepo.find({
        where: {
          driver: auth.driver,
          order_status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])),
        },
        select: {
          driver: false,
          id: false,
          rated: false,
        },
      });

      if (currentOrders.length) {
        return ApiResponse.serviceResponse({
          data: currentOrders,
          code: 'EXISTS',
          status_code: HttpStatus.OK,
        });
      }

      let orders: OrderDriverMatch =
        await this.driverHelper.findOrdersForDriver(auth.driver);

      if (orders.orders.length) {
        const ordersList = orders.orders;

        ordersList.forEach((element) => {
          this.addOrderToDriver(element.id, auth.driver?.id!);
        });

        return ApiResponse.serviceResponse({
          data: orders,
          code: 'NEW_ORDER_FOUND',
          status_code: HttpStatus.FOUND,
        });
      }
    }
    return ApiResponse.serviceResponse({
      code: 'NEW_ORDER_FOUND',
      status_code: HttpStatus.NOT_FOUND,
    });
  }

  async updateLocation(message: any, auth: Auth) {
    if (auth.driver) {
      const driver = auth.driver;
      driver.lat = message['lat'];
      driver.lng = message['lng'];
      this.driverRepo.save(driver);
      const orders = await this.orderRepo.findBy({
        driver: driver,
        order_status: Not(
          In([
            OrderStatus.CANCELLED,
            OrderStatus.COMPLETED,
            OrderStatus.PENDING,
          ]),
        ),
      });
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        code: 'UPDATED',
        data: orders,
      });
    }
    return ApiResponse.serviceResponse({
      status_code: HttpStatus.UNAUTHORIZED,
      code: 'unauthorized',
    });
  }

  async accepted(user: Auth) {
    const driver = user.driver;
    if (driver) {
      const rejectedDrivers: Set<string> = new Set();

      const orders = await this.driverHelper.findOrdersForDriver(driver);
      if (orders.orders.length == 0) {
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.NOT_FOUND,
        });
      }
      for (const element of orders.orders) {
        await this.orderRepo.manager.transaction(async (manager) => {
          // Lock the order row so no other driver can modify it
          const freshOrder = await manager.findOne(Order, {
            where: { id: element.id },
            lock: { mode: 'pessimistic_write' },
          });

          // If order was already taken, skip
          if (!freshOrder || freshOrder.order_status !== OrderStatus.PENDING) {
            return;
          }

          // Assign driver & update status
          freshOrder.driver = driver;
          freshOrder.order_status = OrderStatus.QUEUE;
          await manager.save(freshOrder);

          // Now find all drivers who had this order offered but didn't accept it
          for (const [driverId, ordersSet] of Object.entries(this.socketState.driverOrderList)) {
            if (driverId === driver.id) continue; // Skip the accepted driver
            if (ordersSet.has(element.id)) {
              rejectedDrivers.add(driverId);
              ordersSet.delete(element.id); // Remove order from rejected drivers' sets
            }
          }
        });
      }
      
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        data: {
          rejected_drivers: rejectedDrivers,
          accepted_driver: driver.id,
          order: orders.orders,
        },
      });
    }

    return ApiResponse.serviceResponse({
      status_code : HttpStatus.NOT_FOUND,
    });
  }

  async insertNewOrder(order: Order) {
    const compatibles = await this.driverHelper.findDriversForOrder(order);
    return compatibles;
  }

  addOrderToDriver(driver: string, order: string) {
    // Initialize set if it doesn't exist
    if (!this.socketState.driverOrderList[order]) {
      this.socketState.driverOrderList[order] = new Set<string>();
    }
    this.socketState.driverOrderList[order].add(driver);
  }

  async fastGift() {
    setInterval(async () => {
      const drivers = await this.driverHelper.getAllFastGiftMatches();
      const toSend : Set<string> = new Set();
      for (const [driverId, ordersSet] of Object.entries(drivers)) {
        for (const element of ordersSet) {
          let driverOrders = this.socketState.driversFastGiftList[driverId];
          if (!driverOrders) {
            this.socketState.driversFastGiftList[driverId] = new Set<string>();
            driverOrders = this.socketState.driversFastGiftList[driverId];
          }
          if (!driverOrders.has(element.id)) {
            driverOrders.add(element.id); // add once
            toSend.add(driverId);
            console.log("added");
          }
        }
      }
    }, 3000);

    
  }

  async newOrderStatus(message: any, auth: Auth) {
    const order = await this.orderRepo.findOneBy({
      order_status: Not(
        In([OrderStatus.CANCELLED, OrderStatus.COMPLETED, OrderStatus.PENDING]),
      ),
      driver: auth.driver,
      id: message['order_id'],
    });
    if (order) {
      order.order_status = message['new_status'];
      this.orderRepo.save(order);
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        data: order,
      });
    }
    return ApiResponse.serviceResponse({
      status_code: HttpStatus.NOT_FOUND,
    });
  }

  async cancelOrder( user : Auth , order : Order){
    const driver = order.driver;
    if (!driver && order.order_status == OrderStatus.PENDING) {
      const rejectedDrivers = new Set();
      const driverOrderList = this.socketState.driverOrderList;
      for (const [key,value] of Object.entries(driverOrderList)) {
        if (value.has(order.id)) {
          rejectedDrivers.add(key)
        }
      }
      
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.OK,
        code : "REJECTION",
        data : {
          drivers : rejectedDrivers
        }
      })
      
    }
    else if (driver) {
      const orders = this.orderRepo.findBy({
        driver : driver,
        order_status : Not(In([
          OrderStatus.CANCELLED,
          OrderStatus.COMPLETED,
          OrderStatus.PENDING
        ]))
      })
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.OK,
        code : "UPDATE",
        data : {
          orders : orders
        }
      })
    }
  }
}
