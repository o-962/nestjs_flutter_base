import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res, ValidationPipe } from '@nestjs/common';
import { ApiResponse } from '@src/models/api.model';
import type { FastifyReply } from 'fastify';
import { CreateLangDto } from './dto/create-lang.dto';
import { UpdateLangDto } from './dto/update-lang.dto';
import { LangsService } from './langs.service';

@Controller('langs')
export class LangsController {
  constructor(private readonly langsService: LangsService) {}

  @Post()
  create(@Body(ValidationPipe) createLangDto: CreateLangDto) {
    return this.langsService.create(createLangDto);
  }
  @Get()
  async findAll() {
    return await this.langsService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string , @Res({ passthrough: true }) res: FastifyReply,) {

  
    const result = await this.langsService.findOne(id);
    try {
      let response;
      if (result.status_code == HttpStatus.OK) {
        response = new ApiResponse().successResponse({
          code : "OK",
          data : result.data,
          status_code : HttpStatus.OK
        });
      }
      else if (result.status_code == HttpStatus.NOT_FOUND){
        response = new ApiResponse().error({
          code : "NOT_FOUND",
          status_code : HttpStatus.NOT_FOUND,
        });
      }
      return res.status(result.status_code).send(response)
    } catch (error) {
      return new ApiResponse().serverError({
        status_code : HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        logout : false,
        redirect : false
      });
    }

  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLangDto: UpdateLangDto) {
    return this.langsService.update(id, updateLangDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.langsService.remove(+id);
  }
}
