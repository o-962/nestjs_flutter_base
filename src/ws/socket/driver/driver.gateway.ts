import { HttpStatus, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OrderStatus, SocketEvents } from '@src/common/enums';
import { SocketAuthGuard } from '@src/guards/socket_auth/socket_auth.guard';
import { ApiResponse } from '@src/models/api.model';
import { SocketState } from '@src/services/socket.state';
import { Auth } from '@src/ws/api/auth/entities/auth.entity';
import { Order } from '@src/ws/api/orders/entities/order.entity';
import { Server, Socket } from 'socket.io';
import { DriverService } from './driver.service';

@WebSocketGateway()
export class DriverGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly driverService: DriverService,
    public readonly socketState: SocketState,
  ) {}

  private initialized: boolean = false;

  async handleConnection(@ConnectedSocket() client: Socket) {
    const user: Auth = client['user'];
    if (!this.initialized) {
      this.initialized = true;
      this.fastGift();
    }
  }

  @SubscribeMessage('test')
  @UseGuards(SocketAuthGuard())
  async test() {
    console.log('received');
  }

  @SubscribeMessage(SocketEvents.DRIVER_INIT)
  @UseGuards(SocketAuthGuard())
  async initialize(@ConnectedSocket() client: Socket) {
    try {
      const user: Auth = client['user'];

      if (user && user.driver) {

        client.join(user.driver.id!);
        console.log(`driver joined : ${user.driver.id}`);

        const orders = await this.driverService.initialize(user);
        if (orders.status_code == HttpStatus.FOUND) {
          client.emit(SocketEvents.DRIVER_NEW_ORDER);
        }
        if (orders.status_code == HttpStatus.OK) {
          client.emit(
            SocketEvents.ORDER_DETAILS,
            new ApiResponse({ return_json: true }).successResponse({
              status_code: HttpStatus.OK,
              code: 'EXISTS',
              data: orders.data,
            }),
          );
        }
      } else {
        console.log('====================');
        console.log('USER IS NOT LOGGED');
        console.log('====================');
      }
    } catch (error) {}
  }

  @SubscribeMessage(SocketEvents.ORDER_ACCEPTED)
  @UseGuards(SocketAuthGuard())
  async orderAccepted(@ConnectedSocket() client: Socket) {
    try {
      let user: Auth = client['user'];

      if (user && user.driver) {
        const orders = await this.driverService.accepted(user);
        
        if (orders.status_code == HttpStatus.OK) {
          if (!orders.data) return;

          orders.data.rejected_drivers.forEach((element) => {
            console.log(element);
            
            this.server.to(element).emit(SocketEvents.ORDER_REJECTED);
          });

          orders.data.order.forEach((element) => {
            const id = element.user.id;
            this.server.to(id).emit(
              SocketEvents.ORDER_ACCEPTED,
              new ApiResponse({
                return_json: true,
                toast_header: 'accepted',
                toast_body: 'accepted successfully',
              }).successResponse({
                code: 'DETAILS',
                status_code: HttpStatus.OK,
                data: {
                  name: `${user.first_name} ${user.last_name}`,
                  gender: user.driver?.gender,
                  rating: user.driver?.rating,
                  driver_phone_number: user.driver?.driver_phone_number,
                  driver_other_phone_number:
                    user.driver?.driver_other_phone_number,
                  lat: user.driver?.lat,
                  lng: user.driver?.lng,

                  driver_image: user.driver?.driver_image,
                  vehicle_image: user.driver?.vehicle_image,
                },
              }),
            );
          });

          client.emit(
            SocketEvents.ORDER_DETAILS,
            new ApiResponse({
              return_json: true,
              toast_header: 'accepted',
              toast_body: 'accepted successfully',
            }).successResponse({
              code: 'DETAILS',
              status_code: HttpStatus.OK,
              data: orders.data?.order,
            }),
          );

          return;
        } else if (orders.status_code == HttpStatus.NOT_FOUND) {
          client.emit(SocketEvents.ORDER_REJECTED);
          return;
        }
      } else {
        client.emit(
          SocketEvents.AUTH_UNAUTHORIZED,
          new ApiResponse({
            return_json: true,
            toast_body: 'unknown error occurred',
            toast_header: 'error',
          }).unAuthorized(),
        );
      }
    } catch (error) {

      console.log(error);
      
      client.emit(
        SocketEvents.SYSTEM_ERROR,
        new ApiResponse({
          return_json: true,
          toast_body: 'unknown error occurred',
          toast_header: 'error',
        }).serverError({
          error: error,
          logout: false,
          redirect: false,
        }),
      );
    }
  }

  @UseGuards(SocketAuthGuard())
  @SubscribeMessage(SocketEvents.DRIVER_UPDATE_LOCATION)
  async updateLocation(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (
      !message ||
      typeof message.lat !== 'number' ||
      typeof message.lng !== 'number' ||
      isNaN(message.lat) ||
      isNaN(message.lng)
    ) {
      console.error('Invalid coordinates', message);
      return;
    }

    const auth: Auth = client['user'];
    const response = await this.driverService.updateLocation(message, auth);
    if (response.status_code == HttpStatus.UNAUTHORIZED) {
      return new ApiResponse().unAuthorized();
    } else {
      const data = response.data;
      if (data) {
        data.forEach((element: Order) => {
          const user = element.user.id;
          this.server.to(user).emit(
            SocketEvents.RIDER_UPDATE_LOCATION,
            new ApiResponse().successResponse({
              data: {
                lat: message['lat'],
                lng: message['lng'],
              },
              status_code: HttpStatus.OK,
              code: 'UPDATE_LOCATION',
            }),
          );
        });
      }

      return new ApiResponse({ return_json: true }).successResponse({
        code: 'updated',
        status_code: HttpStatus.OK,
      });
    }
  }

  @UseGuards(SocketAuthGuard())
  @SubscribeMessage(SocketEvents.NEW_ORDER_STATUS)
  async newOrderStatus(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (
      !message['order_id'] ||
      !Object.values(OrderStatus).includes(message['new_status'])
    ) {
      console.log('some data are undefined');
      console.log(message);

      return;
    }

    const auth: Auth = client['user'];

    const order = await this.driverService.newOrderStatus(message, auth);
    console.log(order);

    if (order.status_code == HttpStatus.OK && order.data) {
      const nextStatus = order.data['order_status'];
      const userId = order.data['user']['id'];
      console.log(`new order status is ${nextStatus} and sent to ${userId}`);

      this.server.to(userId).emit(
        SocketEvents.NEW_ORDER_STATUS,
        new ApiResponse({ return_json: true }).successResponse({
          data: {
            new_status: nextStatus,
          },
          code: SocketEvents.NEW_ORDER_STATUS,
          status_code: HttpStatus.OK,
        }),
      );
    } else {
      client.emit(
        SocketEvents.NEW_ORDER_STATUS,
        new ApiResponse({
          return_json: true,
          toast_body: 'error',
          toast_header: 'xxx',
        }).error({
          code: 'NOT_FOUND',
          status_code: HttpStatus.NOT_FOUND,
        }),
      );
    }
  }

  async refreshOrders(order: Order) {
    const compatibles = await this.driverService.insertNewOrder(order);
    compatibles.forEach((compatible) => {
      const driver = compatible.driver.id;
      this.server.to(driver).emit(SocketEvents.DRIVER_NEW_ORDER);
    });
  }
  async fastGift(){

    this.driverService.fastGift();
    
  }
  handleDisconnect(client: Socket) {
    const user: Auth = client['user'];
    if (user && user.driver) {
      client.leave(user.driver.id);
      delete this.socketState.usersList[user.driver.id];
    }
  }

}
