import { Config } from '@src/ws/api/configs/entities/config.entity';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { sharedData } from './common/data';
dotenv.config();

export const dbConfig: PostgresConnectionOptions | DataSourceOptions = {
  type: 'postgres', // literal type
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME || 'tajwal',
  synchronize: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),

};

export const testingDbConfig: PostgresConnectionOptions | DataSourceOptions = {
  ...dbConfig,
  database: `${process.env.DB_NAME}_testing`,
};

async function config(){
  const AppDataSource = new DataSource(dbConfig);
  await AppDataSource.initialize();
  const configRepo = AppDataSource.getRepository(Config);
  let config = await configRepo.findOne({ where: { id: 1 } });
  if (!config) {
    config = configRepo.create();
    await configRepo.save(config);
  }
  sharedData.otp.otp_every = config.otp_every;
  sharedData.otp.otp_length = config.otp_length;
  sharedData.otp.otp_times = config.otp_times
}

config()