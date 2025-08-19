import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLangDto } from './dto/create-lang.dto';
import { UpdateLangDto } from './dto/update-lang.dto';
import { Lang } from './entities/lang.entity';
import { ApiResponse } from '@src/utils/response';

@Injectable()
export class LangsService {
  constructor (
    @InjectRepository(Lang)
    private langRepo : Repository<Lang>
  ){}

  async create(createLangDto: CreateLangDto) {
    return "created"
  }
  
  async findAll() {
    try {
      const langs = await this.langRepo.find({ relations: ['translations'], });
      const grouped = langs.reduce((acc, lang) => {
        const langCode = lang.lang;
        acc[langCode] = {};
        for (const trans of lang.translations) {
          acc[langCode][trans.key] = trans.value;
        }
        return acc;
      }, {} as Record<string, Record<string, string>>);
      return grouped;
    } catch (error) {
      // ServerErrorResponse({error})
    }
    return `This action returns all langs`;
  }
  async findOne(id: string) {
    try{
      const lang = await this.langRepo.findOne({
        where: { lang : id },
        relations: ['translations'],
      });
      if (!lang) {
        return ApiResponse.serviceResponse({
          status_code : HttpStatus.NOT_FOUND,
        })
      }
      const grouped = {
        [lang!.lang]: {},
      };
      for (const trans of lang!.translations) {
        grouped[lang!.lang][trans.key] = trans.value;
      }
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.OK,
        data : grouped
      });
    } catch (error) {
      return ApiResponse.serviceResponse({
        status_code : HttpStatus.INTERNAL_SERVER_ERROR,
        error
      });
    }
  }

  update(id: string, updateLangDto: UpdateLangDto) {
    return `This action updates a #${id} lang`;
  }

  remove(id: number) {
    return `This action removes a #${id} lang`;
  }
}
