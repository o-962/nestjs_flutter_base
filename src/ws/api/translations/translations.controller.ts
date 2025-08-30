import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiResponse } from '@src/models/api.model';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { TranslationsService } from './translations.service';

@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post()
  create(@Body() createTranslationDto: CreateTranslationDto) {
    return this.translationsService.create(createTranslationDto);
  }
  @Get()
  async findAll() {
    const result = await this.translationsService.findAll();
    
    try {

      return new ApiResponse().successResponse({
        code : "OK",
        status_code : HttpStatus.OK,
        data : result!.data
      })
    } catch (error) {
      return new ApiResponse().serverError({
        error : error,
        logout : false,
        redirect : false,
      })
    }
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.translationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranslationDto: UpdateTranslationDto) {
    return this.translationsService.update(+id, updateTranslationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.translationsService.remove(+id);
  }
}
