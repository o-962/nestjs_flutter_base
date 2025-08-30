import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { GiftDetails } from './entities/gift.entity';
import { TaxiDetails } from './entities/taxi.entity';
import { DiscountsService } from '../discounts/discounts.service';
import { Discount } from '../discounts/entities/discount.entity';
import { DriverService } from '@src/ws/socket/driver/driver.service';
import { DriverModule } from '@src/ws/socket/driver/driver.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService,DiscountsService],
  imports: [TypeOrmModule.forFeature([Order, User,GiftDetails,TaxiDetails,Discount]) , DriverModule],

})
export class OrdersModule {}
