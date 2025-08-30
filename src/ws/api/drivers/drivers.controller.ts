import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiResponse } from '@src/models/api.model';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto) {
    
    const response = await this.driversService.create(createDriverDto);

    try {
      if (response.status_code == HttpStatus.CREATED) {
        return new ApiResponse().successResponse({
          status_code : HttpStatus.CREATED,
          code : "CREATED",
        })
      }
      else {
        return new ApiResponse().error({
          status_code : HttpStatus.NO_CONTENT,
          code : "UNDEFINED",
        })
      }
    } catch (error) {
      return new ApiResponse().serverError({
        status_code : HttpStatus.CREATED,
        error : error,
        logout : false,
        redirect : false
      })
    }
  }

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(+id, updateDriverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(+id);
  }
}
