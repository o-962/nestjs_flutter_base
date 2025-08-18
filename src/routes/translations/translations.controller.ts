import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { ServerErrorResponse, SuccessResponse } from '@utils/response';

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
      return SuccessResponse({
        data : result,
        code : "FETCHED",
        status_code : HttpStatus.OK
      })
    } catch (error) {
      ServerErrorResponse({error})
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
