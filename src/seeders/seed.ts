import { dbConfig } from "@src/dbConfig";
import seedDB from "@src/seeders/seeder";

seedDB(dbConfig , true);