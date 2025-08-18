import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
  imports : [TypeOrmModule.forFeature([Auth]) , ],
  controllers: [AuthController],
  providers: [AuthService , JwtStrategy],
  exports : [AuthService]
})
export class AuthModule {}