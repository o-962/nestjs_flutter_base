import { HttpStatus, Injectable } from '@nestjs/common';
import { sharedData } from '@src/common/data';
import { AuthService } from '@src/routes/auth/auth.service';
import { LangsService } from '@src/routes/langs/langs.service';
import { ServerErrorResponse, SuccessResponse } from '@utils/response';
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
      return SuccessResponse({
        status_code : HttpStatus.OK,
        code : "OK",
        data : { translations , user , fields : sharedData.fields},
        page : user ? "/home" : "/welcome"
      });
    } catch (error) {
      ServerErrorResponse({error});
    }
    
  }

}
