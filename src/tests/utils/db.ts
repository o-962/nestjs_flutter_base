import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Auth } from '@routes/auth/entities/auth.entity';
import { Lang } from '@routes/langs/entities/lang.entity';
import { Role } from '@routes/roles/entities/role.entity';
import { Translation } from '@routes/translations/entities/translation.entity';
import { dbConfig } from '@src/dbConfig';
import { Permission } from '@src/routes/permissions/entities/permission.entity';
import { IsExistsValidator } from '@validators/is_exists/is-exists.validator';
import { DataSource, Repository } from 'typeorm';


export async function createTestModule(controllers: any[], providers: any[]) {
  const entities = [Role,Auth, Lang, Translation , Permission];

  const validControllers = controllers;
  const validProviders = providers;
  
  const testDbConfig = { 
    ...dbConfig, 
    database: "myvschool_testing" 
  } as TypeOrmModuleOptions;

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      TypeOrmModule.forRoot(testDbConfig),
      TypeOrmModule.forFeature(entities),
      JwtModule.register({
        secret: process.env.JWT_SECRET as string ,
        signOptions: { expiresIn: '7d' },
      })
    ],
    controllers: validControllers,
    providers: [
      ...validProviders,
      {
        provide: IsExistsValidator,
        useFactory: (dataSource: DataSource) => {
          return new IsExistsValidator(dataSource);
        },
        inject: [DataSource],
      },

    ],
  }).compile();
  
  
  return module;
}