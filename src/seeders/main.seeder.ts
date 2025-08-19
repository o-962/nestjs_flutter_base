import { Auth } from '@routes/auth/entities/auth.entity';
import { Lang } from '@routes/langs/entities/lang.entity';
import { Permission } from '@routes/permissions/entities/permission.entity';
import { Role } from '@routes/roles/entities/role.entity';
import { Translation } from '@routes/translations/entities/translation.entity';
import { User } from '@routes/users/entities/user.entity';
import { seeders } from '@src/seeders/tables';
import { hashPassword } from '@utils/password';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';



export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const authRepo = dataSource.getRepository(Auth);
    const rolesRepo = dataSource.getRepository(Role);
    const langsRepo = dataSource.getRepository(Lang);
    const translationRepo = dataSource.getRepository(Translation);
    const permissionRepo = dataSource.getRepository(Permission);
    const userRepo = dataSource.getRepository(User);

    await permissionRepo.deleteAll();
    await authRepo.deleteAll();
    await rolesRepo.deleteAll();
    await translationRepo.deleteAll();
    await langsRepo.deleteAll();
    await userRepo.deleteAll();

    const roles = seeders.roles;

    try {
      const password = await hashPassword('gh90ghgh');
      const rolesData = await rolesRepo.save(roles);
      const superRole = rolesData.find((r) => r.name === 'super_admin');
      
      let authCreation = authRepo.create({
        ...seeders.auth,
        password,
      });
      const auth = await authRepo.save(authCreation);
      await langsRepo.save(seeders.translations);
      
      console.log('\n✅ DB Seeded successfully');
    } catch (err) {
      console.error('Error saving user:', err);
    }
  }
}
