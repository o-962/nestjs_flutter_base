import { HttpStatus, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OrderExistence, OrderStatus, SocketEvents } from '@src/common/enums';
import { SocketAuthGuard } from '@src/guards/socket_auth/socket_auth.guard';
import { ApiResponse } from '@src/models/api.model';
import { Auth } from '@src/ws/api/auth/entities/auth.entity';
import { Server, Socket } from 'socket.io';
import { RiderService } from './rider.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RiderGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly riderService: RiderService) {}

  @SubscribeMessage(SocketEvents.RIDER_INIT)
  @UseGuards(SocketAuthGuard())
  async create(@ConnectedSocket() client: Socket) {
    try {
      const auth: Auth = client['user'];
      
      if (!auth.user) {
        return
      }
      
      const order = await this.riderService.pending(auth);
      
      client.join(auth.user.id);

      if (order['code'] == OrderExistence.EXISTS) {
        client.emit(
          SocketEvents.RIDER_RIDE_STATUS,
          new ApiResponse({return_json : true}).successResponse({
            code: OrderExistence.EXISTS,
            status_code: HttpStatus.OK,
            data: order['data'],
          }),
        );
        return;
      } else if (order['code'] == OrderExistence.PENDING) {
        client.emit(
          SocketEvents.RIDER_RIDE_STATUS,
          new ApiResponse({return_json : true}).successResponse({
            code: OrderExistence.PENDING,
            status_code: HttpStatus.OK,
          }),
        );
        return;
      } else {
        client.emit(
          SocketEvents.RIDER_RIDE_STATUS,
          new ApiResponse({return_json : true}).error({
            code: OrderExistence.NO_ORDER,
            status_code: HttpStatus.NOT_FOUND,
          }),
        );
        return;
      }
    } catch (error) {
      client.emit(
        SocketEvents.RIDER_RIDE_STATUS,
        new ApiResponse({return_json : true}).serverError({
          error: error,
          logout: false,
          redirect: false,
        }),
      );
    }
  }

  @SubscribeMessage(SocketEvents.ORDER_CANCELLED)
  @UseGuards(SocketAuthGuard())
  async orderCancelled(@ConnectedSocket() client: Socket){
    const auth : Auth = client['user'];
    
    if (auth) {
      const order = await this.riderService.orderCancelled(auth);
      if (order?.status_code == HttpStatus.OK) {
        
        if (order?.code == "REJECTION" && order.data) {
          const drivers = order.data['drivers'];
          console.log(drivers);
          
          for (const key of drivers) {
            console.log(key);
            
            client.to(key).emit(SocketEvents.ORDER_REJECTED)
          }
        }
        
      }
    }
  }
}
