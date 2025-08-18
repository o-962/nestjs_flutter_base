import { appConfig } from "@src/common/data";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import { MainSeeder } from "./main.seeder";

const seedDB = (dbConfig : DataSourceOptions , exist = true) => {
  const options : DataSourceOptions & SeederOptions = {
    ...dbConfig,
    entities : [appConfig.path + '/../**/*.entity{.ts,.js}'],
    synchronize : true,
    logging: ['error'],
    seeds : [MainSeeder],
  }
  
  console.log(`\n\n⚠️  Trying to seed : ${dbConfig.database} table`);
  
  const datasource = new DataSource(options);
  datasource.initialize().then(async () => {
    await datasource.synchronize(true)
    await runSeeders(datasource);
    
    if (exist) {
      console.log("\n✅ Exit after seeding");
      process.exit(0);
    }
    else {
      return true;
    }
  }).catch(err => {
    console.error('Error:', err);
  });
};

export default seedDB;