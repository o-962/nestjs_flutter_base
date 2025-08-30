import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { Auth } from '../auth/entities/auth.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  controllers: [DriversController],
  providers: [DriversService],
  imports : [TypeOrmModule.forFeature([Driver,Auth,User,Role])]
})
export class DriversModule {}
