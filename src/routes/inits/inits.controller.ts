import { Controller, Get, Req } from '@nestjs/common';
import { anyResponse } from '@src/utils/response';
import { FastifyRequest } from 'fastify';
import { InitsService } from './inits.service';

@Controller()
export class InitsController {
  constructor(private readonly initsService: InitsService) {}

  @Get('/init')
  async findAll(@Req() req: FastifyRequest) {
    const response = await this.initsService.find(req);
    return anyResponse(response);
  }

}
