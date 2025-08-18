import { Auth } from '@src/routes/auth/entities/auth.entity';
import { Repository } from 'typeorm';

export async function seedAuth( authRepo : Repository<Auth> ) {
  authRepo.deleteAll();
}