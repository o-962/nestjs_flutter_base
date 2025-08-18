import { testingDbConfig } from '@src/dbConfig';
import seedDB from '@src/seeders/seeder';
import 'tsconfig-paths/register';

export default async () => {
  seedDB(testingDbConfig, false)
};