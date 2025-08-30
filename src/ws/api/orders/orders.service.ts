import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryType, GiftType, OrderStatus } from '@src/common/enums';
import { ApiResponse } from '@src/models/api.model';
import { calcCosts, validateOrder } from '@src/utils/order_utils';
import { Repository } from 'typeorm';
import { Auth } from '../auth/entities/auth.entity';
import { DiscountsService } from '../discounts/discounts.service';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { GiftDetails } from './entities/gift.entity';
import { Order } from './entities/order.entity';
import { TaxiDetails } from './entities/taxi.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TaxiDetails)
    private readonly taxiRepo: Repository<TaxiDetails>,
    @InjectRepository(GiftDetails)
    private readonly giftDetails: Repository<GiftDetails>,
    private readonly discountServices: DiscountsService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const auth: Auth = createOrderDto['user'];
    try {
      
      const user = await this.userRepo.findOne({
        where: { id: auth.user?.id },
      });
      const pastOrder = await this.orderRepo.findOne({
        where: { order_status: OrderStatus.PENDING },
      });

      if (!user)
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.NOT_FOUND,
        });
      if (pastOrder)
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.CONFLICT,
        });

      const cost = calcCosts(createOrderDto);
      if (!cost)
        return ApiResponse.serviceResponse({
          status_code: HttpStatus.BAD_REQUEST,
        });

      createOrderDto['user'] = user;

      let discountedCost;
      
      if (createOrderDto.discount_code) {
        const discount = await this.discountServices.validateDiscount(
          cost,
          createOrderDto.discount_code,
        );
        if (!discount.ok) {
          return ApiResponse.serviceResponse({
            status_code: 404,
            message: discount.message,
          });
        }
        discountedCost = discount.discountedCost;
      }
      
      let orderData: any = {
        ...createOrderDto,
        cost,
        cost_discounted: discountedCost,
      };

      
      if (createOrderDto.delivery_type === DeliveryType.GIFTS) {
        orderData.gift_details = this.giftDetails.create({
          giftType: createOrderDto.gift_type as GiftType,
        });
      } else if (createOrderDto.delivery_type === DeliveryType.TAXI) {
        createOrderDto = validateOrder(createOrderDto);
        orderData.taxi_details = this.taxiRepo.create({ ...createOrderDto });
      }

      const order = this.orderRepo.create(orderData);
      await this.orderRepo.save(order);

      return ApiResponse.serviceResponse({
        status_code: HttpStatus.CREATED,
        data : {
          order: order
        }
      });
    } catch (error) {
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  }
}
