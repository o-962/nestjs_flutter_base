import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { appConfig } from '@src/common/data';
import { AuthGuard } from '@src/guards/auth/auth.guard';
import { ApiResponse } from '@src/models/api.model';
import { FastifyRequest } from 'fastify';
import { InitsService } from './inits.service';

@Controller()
export class InitsController {
  constructor(private readonly initsService: InitsService) {}

  @Get('/user-init')
  @UseGuards(AuthGuard({bypass : true}))
  async userInit(@Req() req: FastifyRequest) {
    
    try {
      const response = await this.initsService.riderInit(req);
      
      if (response.status_code == HttpStatus.OK) {
        return new ApiResponse({ redirect: response.redirect }).successResponse(
          {
            code: 'success',
            data: response.data,
            status_code: HttpStatus.OK,
          },
        );
      }
    } catch (error) {
      return new ApiResponse().serverError({
        error,
        logout: false,
        redirect: appConfig.routes.rider.error,
      });
    }
  }

  @Get('/driver-init')
  @UseGuards(AuthGuard({bypass : true}))
  async driverInit(@Req() req: FastifyRequest) {
    
    try {
      const response = await this.initsService.driverInit(req);
      
      return new ApiResponse({ redirect: response.redirect }).successResponse(
        {
          code: 'success',
          data: response.data,
          status_code: HttpStatus.OK,
          
        },
      );
      
    } catch (error) {
      return new ApiResponse().serverError({
        error,
        logout: false,
        redirect: appConfig.routes.driver.error,
      });
    }
  }
}
