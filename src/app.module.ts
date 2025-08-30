import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from '@src/ws/api/auth/auth.module';
import { InitsModule } from '@src/ws/api/inits/inits.module';
import { LangsModule } from '@src/ws/api/langs/langs.module';
import { TranslationsModule } from '@src/ws/api/translations/translations.module';
import { UsersModule } from '@src/ws/api/users/users.module';
import { AtLeastOneValidator } from '@validators/at_least_one/at-least-one.validator';
import { IsExistsValidator } from '@validators/is_exists/is-exists.validator';
import { IsNotExistsValidator } from '@validators/not_is_exists/is-not-exists.validator';
import * as dotenv from 'dotenv';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './dbConfig';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigsModule } from './ws/api/configs/configs.module';
import { DiscountsModule } from './ws/api/discounts/discounts.module';
import { DriversModule } from './ws/api/drivers/drivers.module';
import { OrdersModule } from './ws/api/orders/orders.module';
import { PermissionsModule } from './ws/api/permissions/permissions.module';
import { RolesModule } from './ws/api/roles/roles.module';
import { NotificationsGateway } from './ws/socket/notifications/notifications.gateway';
import { RiderModule } from './ws/socket/rider/rider.module';
import { DriverModule } from './ws/socket/driver/driver.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig as TypeOrmModuleOptions),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET as string ,
      signOptions: { expiresIn: '71h' },
      global : true,
    }),
    TranslationsModule,
    LangsModule,
    InitsModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    NestjsFormDataModule.config({
      isGlobal  :true,
      cleanupAfterFailedHandle : true,
      cleanupAfterSuccessHandle : true,
      storage : MemoryStoredFile
    }),
    NotificationsModule,
    ConfigsModule,
    OrdersModule,
    DiscountsModule,
    DriversModule,
    RiderModule,
    DriverModule
  ],
  controllers: [AppController],
  providers: [AppService,NotificationsGateway  , IsNotExistsValidator , IsExistsValidator , AtLeastOneValidator],
  exports : [JwtModule]
})
export class AppModule {}