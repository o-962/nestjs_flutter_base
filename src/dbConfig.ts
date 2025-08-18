import * as dotenv from 'dotenv';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies/snake-naming.strategy';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
dotenv.config();

export const dbConfig: PostgresConnectionOptions | DataSourceOptions = {
  type: 'postgres', // literal type
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME || 'myvschool',
  synchronize: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  namingStrategy: new SnakeNamingStrategy(),

};

export const testingDbConfig: PostgresConnectionOptions | DataSourceOptions = {
  ...dbConfig,
  database: `${process.env.DB_NAME}_testing`,
};