import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
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
  async findOne(@Param('id') id: string) {
    return this.langsService.findOne(id);
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
