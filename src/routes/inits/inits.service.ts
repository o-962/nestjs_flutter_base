import { HttpStatus, Injectable } from '@nestjs/common';
import { sharedData } from '@src/common/data';
import { AuthService } from '@src/routes/auth/auth.service';
import { LangsService } from '@src/routes/langs/langs.service';
import { ApiResponse } from '@src/utils/response';
import { FastifyRequest } from 'fastify';

@Injectable()
export class InitsService {
  constructor(
    private readonly langsServices: LangsService,
    private readonly authServices : AuthService
  ) {}

  async find(req : FastifyRequest) {
    try {
      const translations = await this.langsServices.findAll();
      const user = await this.authServices.me(req);
      
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.OK,
        data : { translations , user , fields : sharedData.fields},
        redirect : user ? sharedData.app_routes.rider.home : sharedData.app_routes.rider.welcome
      })
    } catch (error) {
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.INTERNAL_SERVER_ERROR,
        error : error,
      })
    }
    
  }

}
