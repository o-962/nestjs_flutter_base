import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '@routes/drivers/entities/driver.entity';
import { Order } from '@routes/orders/entities/order.entity';
import { User } from '@routes/users/entities/user.entity';
import { Auth } from '@src/ws/api/auth/entities/auth.entity';
import { DriverGateway } from './driver.gateway';
import { DriverOrderMatchingHelper } from './driver.helper';
import { DriverService } from './driver.service';
import { SocketState } from '@src/services/socket.state';
@Module({
  imports: [TypeOrmModule.forFeature([Driver, User, Order,Auth])],
  providers: [DriverGateway, DriverService, SocketState , DriverOrderMatchingHelper ],
  exports: [SocketState,DriverService,DriverGateway,DriverOrderMatchingHelper] 
})

export class DriverModule {}
