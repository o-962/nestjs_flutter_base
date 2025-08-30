import { HttpStatus, Injectable } from '@nestjs/common';
import { sharedData } from '@src/common/data';
import { ApiResponse } from '@src/models/api.model';
import { AuthService } from '@src/ws/api/auth/auth.service';
import { LangsService } from '@src/ws/api/langs/langs.service';
import { FastifyRequest } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Auth } from '../auth/entities/auth.entity';

@Injectable()
export class InitsService {
  constructor(
    private readonly langsServices: LangsService,
    private readonly authServices: AuthService,
  ) {}
  
  async riderInit(req: FastifyRequest) {
    try {
      const translations = await this.langsServices.findAll();
      const user = req['user'];
      const filePath = join(process.cwd(), 'uploads', 'map.json');
      const fileContent = readFileSync(filePath, 'utf8');
      const map = JSON.parse(fileContent);

      
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        data: { translations, 'auth' : user , fields: sharedData.fields , costs : sharedData.costs , map },
        redirect: await this.authServices.authRoute(user),
      });
    } catch (error) {
      
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error,
      });
    }
  }
  async driverInit(req: FastifyRequest) {
    try {
      const translations = await this.langsServices.findAll();
      const user : Auth = req['user'];
      
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.OK,
        data: {
          translations,
          'auth' : user ,
          fields: sharedData.fields
        },
        redirect: await this.authServices.authRoute(user),
      });
      
      
    } catch (error) {
      
      return ApiResponse.serviceResponse({
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error,
      });
    }
  }
}
