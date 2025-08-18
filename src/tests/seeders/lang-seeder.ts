import { Lang } from '@src/routes/langs/entities/lang.entity';
import { Translation } from '@src/routes/translations/entities/translation.entity';
import { mockRequest } from '@src/tests/common/mockRequest';
import { Repository } from 'typeorm';

export async function seedLang( langRepo: Repository<Lang>, translationRepo: Repository<Translation> ) {
  await translationRepo.deleteAll();
  await langRepo.deleteAll();
  
  const langEntities = langRepo.create(mockRequest.lang);
  await langRepo.save(langEntities);
}