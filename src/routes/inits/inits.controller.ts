import { Controller, Get, HttpStatus, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { InitsService } from './inits.service';
import { ApiResponse } from '@src/utils/response';
import { sharedData } from '@src/common/data';

@Controller()
export class InitsController {
  constructor(private readonly initsService: InitsService) {}

  @Get('/init')
  async findAll(@Req() req: FastifyRequest) {
    try {
      const response = await this.initsService.find(req);
      if (response.status_code == HttpStatus.OK) {
        return new ApiResponse({redirect : response.redirect}).successResponse({
          code : "success",
          data : response.data,
          status_code : HttpStatus.OK
        })
      }
    } catch (error) {
      return new ApiResponse().serverError({
        error,
        logout : false,
        redirect : sharedData.app_routes.rider.error
      })
    }
  }

}
