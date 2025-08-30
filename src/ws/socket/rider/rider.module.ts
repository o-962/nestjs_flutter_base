import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketState } from '@src/services/socket.state';
import { Driver } from '@src/ws/api/drivers/entities/driver.entity';
import { Order } from '@src/ws/api/orders/entities/order.entity';
import { User } from '@src/ws/api/users/entities/user.entity';
import { DriverModule } from '../driver/driver.module';
import { RiderGateway } from './rider.gateway';
import { RiderService } from './rider.service';
import { DriverGateway } from '../driver/driver.gateway';

@Module({
  providers: [RiderGateway, RiderService,SocketState],
  imports : [TypeOrmModule.forFeature([Order,Driver,User]),DriverModule],
})
export class RiderModule {}
