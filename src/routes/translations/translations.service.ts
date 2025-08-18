import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServerErrorResponse } from '@utils/response';
import { Repository } from 'typeorm';
import { CreateTranslationDto } from './dto/create-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { Translation } from './entities/translation.entity';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(Translation)
    private translationRepo:Repository<Translation>
  ){}

  create(createTranslationDto: CreateTranslationDto) {
    return 'This action adds a new translation';
  }

  async findAll() {
    try {
      const translations = await this.translationRepo.find();
      return translations
    } catch (error) {
      console.log(error);
      
      ServerErrorResponse({error})
    }
  }
  findOne(id: number) {
    return `This action returns a #${id} translation`;
  }

  update(id: number, updateTranslationDto: UpdateTranslationDto) {
    return `This action updates a #${id} translation`;
  }

  remove(id: number) {
    return `This action removes a #${id} translation`;
  }
}
