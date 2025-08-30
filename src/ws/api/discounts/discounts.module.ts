import { Module } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountsController } from './discounts.controller';
import { TypeORMError } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { Discount } from './entities/discount.entity';

@Module({
  controllers: [DiscountsController],
  providers: [DiscountsService],
  imports : [TypeOrmModule.forFeature([Order,Discount])]
})
export class DiscountsModule {}
