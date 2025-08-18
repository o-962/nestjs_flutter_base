import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from '@src/routes/translations/entities/translation.entity';
import { Lang } from './entities/lang.entity';
import { LangsController } from './langs.controller';
import { LangsService } from './langs.service';

@Module({
  imports : [TypeOrmModule.forFeature([Lang , Translation])],
  controllers: [LangsController],
  providers: [LangsService],
  exports:[LangsService]
})
export class LangsModule {}
