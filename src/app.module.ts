import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from '@routes/auth/auth.module';
import { InitsModule } from '@routes/inits/inits.module';
import { LangsModule } from '@routes/langs/langs.module';
import { TranslationsModule } from '@routes/translations/translations.module';
import { UsersModule } from '@routes/users/users.module';
import { AtLeastOneValidator } from '@validators/at_least_one/at-least-one.validator';
import { IsExistsValidator } from '@validators/is_exists/is-exists.validator';
import { IsNotExistsValidator } from '@validators/not_is_exists/is-not-exists.validator';
import * as dotenv from 'dotenv';
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './dbConfig';
import { PermissionsModule } from './routes/permissions/permissions.module';
import { RolesModule } from './routes/roles/roles.module';

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
    })
  ],
  controllers: [AppController],
  providers: [AppService , IsNotExistsValidator , IsExistsValidator , AtLeastOneValidator],
  exports : [JwtModule]
})
export class AppModule {}