import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorResponse, ServerErrorResponse } from '@utils/response';
import { Repository } from 'typeorm';
import { CreateLangDto } from './dto/create-lang.dto';
import { UpdateLangDto } from './dto/update-lang.dto';
import { Lang } from './entities/lang.entity';

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
      ServerErrorResponse({error})
    }
    return `This action returns all langs`;
  }
  async findOne(id: string) {
    try{
      const lang = await this.langRepo.findOne({
        where: { lang : id },
        relations: ['translations'],
      });
      console.log(lang);
      
      if (!lang) {
        
        throw ErrorResponse({
          code: 'NOT_FOUND',
          message: 'Language not found',
          status_code : 404
        });
        
      }
      const grouped = {
        [lang!.lang]: {},
      };
      for (const trans of lang!.translations) {
        grouped[lang!.lang][trans.key] = trans.value;
      }
      return grouped;
    } catch (error) {
      throw ServerErrorResponse({error});
    }
  }

  update(id: string, updateLangDto: UpdateLangDto) {
    return `This action updates a #${id} lang`;
  }

  remove(id: number) {
    return `This action removes a #${id} lang`;
  }
}
