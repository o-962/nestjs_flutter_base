import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { appConfig } from '@src/common/data';
import { AuthGuard } from '@src/guards/auth/auth.guard';
import { ApiResponse } from '@src/models/api.model';
import { DriverGateway } from '@src/ws/socket/driver/driver.gateway';
import { DriverService } from '@src/ws/socket/driver/driver.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly driverServices: DriverService,
    private driverGateway: DriverGateway

  ) {}

  @UseGuards(AuthGuard())
  @Post() 
  async create(@Body() createOrderDto: CreateOrderDto , @Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    createOrderDto['user'] = req['user'];
    const response = await this.ordersService.create(createOrderDto);
    
    
    if (response.status_code == HttpStatus.CREATED) {
      this.driverGateway.refreshOrders(response.data!['order']);
      
      
      return new ApiResponse({
        clear_routes : true,
        redirect : appConfig.routes.rider.pending,
      }).successResponse({
        status_code : HttpStatus.CREATED,
        code : "CREATED"
      })
    }
    if (response!['status_code'] == HttpStatus.NOT_FOUND) {
      return new ApiResponse({
        message : response.message
      }).error({
        code : "NO_DISCOUNT_CODE",
        status_code : HttpStatus.NOT_FOUND,
      })
    }
    if (response!['status_code'] == HttpStatus.BAD_REQUEST) {
      return new ApiResponse({
        logout : true
      }).error({
        code : "NO_COSTS",
        status_code : HttpStatus.BAD_REQUEST,
      })
    }
    if (response!['status_code'] == HttpStatus.CONFLICT) {
      return new ApiResponse({
        redirect : appConfig.routes.rider.pending,
        clear_routes : true,
      }).error({
        code : "ALREADY_EXISTS",
        status_code : HttpStatus.CONFLICT
      })
    }
    if (response!['status_code'] == HttpStatus.CREATED) {
      return new ApiResponse({
        redirect : appConfig.routes.rider.pending
      }).successResponse({
        status_code : HttpStatus.CREATED,
        code : "SUCCESSFULLY"
      })
    }

    return ;
  }

}
