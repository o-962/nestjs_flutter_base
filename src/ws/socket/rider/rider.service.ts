import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderExistence, OrderStatus } from '@src/common/enums';
import { ApiResponse } from '@src/models/api.model';
import { RiderDriverModel } from '@src/models/rider_driver.model';
import { Auth } from '@src/ws/api/auth/entities/auth.entity';
import { Driver } from '@src/ws/api/drivers/entities/driver.entity';
import { Order } from '@src/ws/api/orders/entities/order.entity';
import { In, Not, Repository } from 'typeorm';
import { DriverGateway } from '../driver/driver.gateway';
import { CreateRiderDto } from './dto/create-rider.dto';
import { SocketState } from '@src/services/socket.state';
import { DriverService } from '../driver/driver.service';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly driverGateway: DriverGateway,
    private readonly driverServices: DriverService,
  ) {}
  create(createRiderDto: CreateRiderDto) {
    return 'This action adds a new rider';
  }
  async pending(auth: Auth) {
    const order = await this.orderRepository.findOne({
      where: { user: auth.user },
      order: { created_at: 'DESC' }, // latest first
    });
    if (order) {
      let status = order.order_status;
      if (status == OrderStatus.PENDING) {
        console.log('status is peinding');

        this.driverGateway.refreshOrders(order);
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.OK,
          code: OrderExistence.PENDING,
        });
      } else if (
        status == OrderStatus.CANCELLED ||
        status == OrderStatus.COMPLETED
      ) {
        console.log('status is can or com');
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.OK,
          code: OrderExistence.NO_ORDER,
        });
      } else {
        console.log('the issue is here');
        if (!order.driver || order.order_status == OrderStatus.PENDING) {
          return ApiResponse.serviceResponse({
            status_code: HttpStatus.OK,
            code: OrderExistence.PENDING,
          });
        }

        const data: RiderDriverModel = {
          car_seats: order.driver.car_seats,
          driver_image: order.driver.driver_image,
          gender: order.driver.gender,
          lat: order.driver.lat,
          lng: order.driver.lng,
          driver_other_phone_number: order.driver.driver_other_phone_number,
          driver_phone_number: order.driver.driver_phone_number,
          name: `${auth.first_name} ${auth.last_name}`,
          rating: order.driver.rating,
          vehicle_image: order.driver.vehicle_image,
          driver_license_number: order.driver.driver_license_number,
        };
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.OK,
          code: OrderExistence.EXISTS,
          data,
        });
      }
    }
    return ApiResponse.serviceResponse({
      status_code: HttpStatus.OK,
      code: OrderExistence.NO_ORDER,
    });
  }

  async orderCancelled(auth: Auth) {
    const user = auth.user;
    if (user) {
      const order = await this.orderRepository.findOne({
        where: {
          user: user,
          order_status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])),
        },
        order: { created_at: 'DESC' }
      });
      if (order) {
        return this.driverServices.cancelOrder(auth ,order);
      }
    }
  }
}
