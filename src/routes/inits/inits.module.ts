import { Module } from '@nestjs/common';
import { LangsModule } from '@src/routes/langs/langs.module';
import { InitsController } from './inits.controller';
import { InitsService } from './inits.service';

@Module({
  controllers: [InitsController],
  providers: [InitsService],
  imports : [LangsModule]
})
export class InitsModule {}
