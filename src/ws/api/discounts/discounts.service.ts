import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryType } from '@src/common/enums';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './entities/discount.entity';

type ValidateDiscountResult = Discount | { ok: false };

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountRepo: Repository<Discount>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    let x = await this.validateDiscount(100, 'xxx', DeliveryType.GIFTS);
    return 'This action adds a new discount';
  }

  findAll() {
    return `This action returns all discounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discount`;
  }

  update(id: number, updateDiscountDto: UpdateDiscountDto) {
    return `This action updates a #${id} discount`;
  }

  remove(id: number) {
    return `This action removes a #${id} discount`;
  }

  async validateDiscount(
    cost: number,
    code: string,
    deliveryType?: DeliveryType,
  ): Promise<{
    ok: boolean;
    discountedCost: number;
    message: string;
  }> {
    try {
      const discount = await this.discountRepo.findOne({ where: { code } });
      const now = new Date();

      if (!discount)
        return {
          ok: false,
          discountedCost: cost,
          message: 'Discount not found',
        };

      if (!discount.is_active)
        return {
          ok: false,
          discountedCost: cost,
          message: 'Discount is not active',
        };

      if (now < discount.start_date)
        return {
          ok: false,
          discountedCost: cost,
          message: 'Discount has not started yet',
        };

      if (now > discount.end_date)
        return {
          ok: false,
          discountedCost: cost,
          message: 'Discount has expired',
        };

      if (
        discount.usage_limit > 0 &&
        discount.used_count >= discount.usage_limit
      )
        return {
          ok: false,
          discountedCost: cost,
          message: 'Discount usage limit reached',
        };

      if (deliveryType && discount.applicable_to?.length) {
        if (!discount.applicable_to.includes(deliveryType)) {
          return {
            ok: false,
            discountedCost: cost,
            message: `Discount does not apply for ${deliveryType} orders`,
          };
        }
      }

      let discountedCost = cost;

      if (discount.type === 'percent') {
        discountedCost = cost - (cost * discount.percentage) / 100;
        if (discount.max_amount) {
          // Limit the discount to max_amount
          discountedCost = Math.max(cost - discount.max_amount, discountedCost);
        }
      } else if (discount.type === 'fixed') {
        const fixedAmount = discount.max_amount ?? 0; // use max_amount as fixed discount
        discountedCost = Math.max(0, cost - fixedAmount);
      }

      return {
        ok: true,
        discountedCost,
        message: `Discount applied: ${discount.type === 'percent' ? discount.percentage + '%' : discount.max_amount + ' off'}`,
      };
    } catch (err) {
      return {
        ok: false,
        discountedCost: cost,
        message: 'Error applying discount',
      };
    }
  }
}
